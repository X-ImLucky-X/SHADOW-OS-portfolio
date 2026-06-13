import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { parseCommand } from '../data/terminalCommands';
import { useWindowStore, AppId } from '../store/windowStore';
import { useSystemStore } from '../store/systemStore';
import { useNotificationStore } from '../store/notificationStore';
import 'xterm/css/xterm.css';

export const TerminalApp: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const { openWindow } = useWindowStore();
  const { toggleMatrix } = useSystemStore();
  const { addNotification } = useNotificationStore();

  const terminalWindow = useWindowStore((state) => state.windows.terminal);
  const isMaximized = terminalWindow?.isMaximized;
  const width = terminalWindow?.width;
  const height = terminalWindow?.height;
  const isOpen = terminalWindow?.isOpen;

  // Fit terminal on layout or window state updates (e.g. maximizing/resizing inside ShadowOS)
  useEffect(() => {
    const triggerFit = () => {
      try {
        if (fitAddonRef.current && terminalRef.current && terminalRef.current.clientWidth > 0) {
          fitAddonRef.current.fit();
        }
      } catch (e) {
        console.warn('Xterm fit addon error:', e);
      }
    };

    triggerFit();
    const timer = setTimeout(triggerFit, 50);
    return () => clearTimeout(timer);
  }, [isMaximized, width, height, isOpen]);

  // Uptime tracker
  const sessionStartTime = useRef(Date.now());

  // Command History and State
  const inputBufferRef = useRef('');
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isBusyRef = useRef(false);

  const availableCommands = [
    'help',
    'whoami',
    'skills',
    'projects',
    'resume',
    'contact',
    'ls',
    'pwd',
    'cat about.txt',
    'cat matrix.sh',
    'cat hack.sh',
    'open terminal',
    'open projects',
    'open about',
    'open resume',
    'open skills',
    'open contact',
    'open ai',
    'clear',
    'neofetch',
    'matrix',
    'hack',
    'sudo hire me',
    'sudo rm -rf /',
  ];

  const writePrompt = (term: Terminal) => {
    // Green prompt arrow (\x1b[38;5;48m) + white reset
    term.write('\r\n\x1b[38;5;48m› \x1b[0m');
  };

  const executeCommand = (term: Terminal, rawCmd: string) => {
    const uptimeSec = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    const trimmed = rawCmd.trim();

    if (!trimmed) {
      writePrompt(term);
      return;
    }

    // Save to history
    historyRef.current.push(rawCmd);
    historyIndexRef.current = historyRef.current.length;

    term.write('\r\n');

    // Parse commands via core helper
    const response = parseCommand(trimmed, uptimeSec);

    // Custom terminal-level actions (e.g. clear, hack simulation, app redirects)
    if (response.action === 'clear') {
      term.clear();
      // Reset term to top without prepending \r\n
      term.write('\x1b[H\x1b[2J');
      term.write('\x1b[38;5;48mShadowOS Terminal Shell v2.0\x1b[0m\r\nType \x1b[38;5;81mhelp\x1b[0m to list available telemetry nodes.');
      writePrompt(term);
      return;
    }

    if (response.action === 'hack') {
      // Run visual progress simulation inside the terminal canvas buffer
      isBusyRef.current = true;
      let progress = 0;
      term.write('Bypassing security credentials...\r\n');

      const hackTimer = setInterval(() => {
        progress += 4;
        const width = 25;
        const filled = Math.round((progress / 100) * width);
        const empty = width - filled;
        
        // Return carriage and write bar
        term.write(`\r[${'='.repeat(filled)}${'>'}${'.'.repeat(empty)}] ${progress}%`);

        if (progress >= 100) {
          clearInterval(hackTimer);
          term.write('\r\n\x1b[38;5;201mAccess clearance: BLOCKED. Cause: lol no.\x1b[0m\r\n');
          isBusyRef.current = false;
          writePrompt(term);
        }
      }, 60);
      return;
    }

    if (response.action === 'matrix') {
      toggleMatrix(true);
      addNotification('Matrix terminal override executed.', 'warning');
    }

    if (response.action === 'open_app' && response.actionArg) {
      openWindow(response.actionArg as AppId);
    }

    // Standard outputs printing line-by-line
    response.lines.forEach((line) => {
      // Replace normal linebreaks with terminal carrier lines
      term.write(line + '\r\n');
    });

    writePrompt(term);
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    // Instantiate Xterm
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'underline',
      theme: {
        background: 'transparent',
        foreground: 'rgba(255, 255, 255, 0.85)',
        cursor: 'var(--accent-green)',
        selectionBackground: 'rgba(0, 245, 160, 0.25)',
      },
      fontFamily: 'JetBrains Mono, Courier New, monospace',
      fontSize: 12,
      lineHeight: 1.4,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    termInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome Screen Header
    term.write('\x1b[38;5;48mShadowOS Terminal Shell v2.0\x1b[0m\r\n');
    term.write('Type \x1b[38;5;81mhelp\x1b[0m to list available telemetry nodes.');
    term.write('\r\n\x1b[38;5;48m› \x1b[0m');

    // Handle Keyboard Inputs
    term.onData((data) => {
      if (isBusyRef.current) return;

      const code = data.charCodeAt(0);

      // Enter key
      if (code === 13) {
        const cmd = inputBufferRef.current;
        inputBufferRef.current = '';
        executeCommand(term, cmd);
      }
      // Backspace
      else if (code === 127) {
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          // Move cursor back, overwrite with space, move back again
          term.write('\b \b');
        }
      }
      // Tab Autocomplete
      else if (code === 9) {
        const currentBuffer = inputBufferRef.current.toLowerCase();
        if (!currentBuffer) return;

        const matches = availableCommands.filter((c) => c.startsWith(currentBuffer));
        if (matches.length === 1) {
          // Exactly one match -> autocomplete
          const charsToAppend = matches[0].substring(currentBuffer.length);
          inputBufferRef.current += charsToAppend;
          term.write(charsToAppend);
        } else if (matches.length > 1) {
          // Multiple matches -> print candidates
          term.write('\r\n');
          matches.forEach((m) => term.write(m + '   '));
          term.write('\r\n\x1b[38;5;48m› \x1b[0m' + inputBufferRef.current);
        }
      }
      // Special key escape sequences (Arrows etc.)
      else if (data === '\u001b[A') {
        // Arrow Up -> History previous
        if (historyRef.current.length > 0 && historyIndexRef.current > 0) {
          historyIndexRef.current--;
          // Clear current prompt line buffer
          const charsToDelete = inputBufferRef.current.length;
          term.write('\b \b'.repeat(charsToDelete));
          
          const pastCmd = historyRef.current[historyIndexRef.current];
          inputBufferRef.current = pastCmd;
          term.write(pastCmd);
        }
      } else if (data === '\u001b[B') {
        // Arrow Down -> History next
        if (historyIndexRef.current < historyRef.current.length - 1) {
          historyIndexRef.current++;
          const charsToDelete = inputBufferRef.current.length;
          term.write('\b \b'.repeat(charsToDelete));
          
          const pastCmd = historyRef.current[historyIndexRef.current];
          inputBufferRef.current = pastCmd;
          term.write(pastCmd);
        } else if (historyIndexRef.current === historyRef.current.length - 1) {
          historyIndexRef.current++;
          const charsToDelete = inputBufferRef.current.length;
          term.write('\b \b'.repeat(charsToDelete));
          inputBufferRef.current = '';
        }
      }
      // Ctrl+L -> Clear Console
      else if (data === '\u000c') {
        term.clear();
        term.write('\x1b[H\x1b[2J');
        term.write('\x1b[38;5;48mShadowOS Terminal Shell v2.0\x1b[0m\r\nType \x1b[38;5;81mhelp\x1b[0m to list available telemetry nodes.');
        term.write('\r\n\x1b[38;5;48m› \x1b[0m' + inputBufferRef.current);
      }
      // Printable characters
      else if (code >= 32 && code <= 126) {
        inputBufferRef.current += data;
        term.write(data);
      }
    });

    // Listen to window size changes
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    // Listen for custom trigger commands dispatched from ContextMenu/GUI apps
    const handleCustomCommand = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const cmd = customEvent.detail;
      if (cmd) {
        term.write(cmd);
        inputBufferRef.current = cmd;
        setTimeout(() => {
          inputBufferRef.current = '';
          executeCommand(term, cmd);
        }, 300);
      }
    };
    window.addEventListener('terminal-command', handleCustomCommand);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('terminal-command', handleCustomCommand);
      term.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#050508]/85 overflow-hidden border border-white/5 relative">
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
};
