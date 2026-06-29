import React, { useEffect, useRef, useState } from 'react';
import { useSystemStore } from '../store/systemStore';
import { useWindowStore } from '../store/windowStore';
import { useNotificationStore } from '../store/notificationStore';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, AppWindow, FileDown, Mail, Eye, ShieldAlert, Sparkles, Command, User, BarChart2, Gamepad2, Globe } from 'lucide-react';

interface PaletteOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPalette, toggleMatrix, setWallpaperStyle } = useSystemStore();
  const { openWindow } = useWindowStore();
  const { addNotification } = useNotificationStore();
  const shouldReduceMotion = useReducedMotion();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const options: PaletteOption[] = [
    {
      id: 'terminal',
      title: 'Open Terminal',
      subtitle: 'Launch interactive terminal shell',
      icon: <Terminal className="w-4 h-4 text-accent-green" />,
      action: () => openWindow('terminal'),
    },
    {
      id: 'projects',
      title: 'View Projects',
      subtitle: 'Browse featured project bento cards',
      icon: <AppWindow className="w-4 h-4 text-accent-violet" />,
      action: () => openWindow('projects'),
    },
    {
      id: 'about',
      title: 'About Lakshya',
      subtitle: 'Open biography and career timeline',
      icon: <User className="w-4 h-4 text-accent-pink" />,
      action: () => openWindow('about'),
    },
    {
      id: 'skills',
      title: 'System Skills',
      subtitle: 'View radar charts and skill badges',
      icon: <BarChart2 className="w-4 h-4 text-accent-cyan" />,
      action: () => openWindow('skills'),
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      subtitle: 'Chat with custom Claude-Sonnet assistant model',
      icon: <Sparkles className="w-4 h-4 text-accent-amber" />,
      action: () => openWindow('ai'),
    },
    {
      id: 'resume',
      title: 'View Resume & Download',
      subtitle: 'Simulate resume build download and preview document',
      icon: <FileDown className="w-4 h-4 text-accent-green" />,
      action: () => openWindow('resume'),
    },
    {
      id: 'contact',
      title: 'Contact Form',
      subtitle: 'Send direct messaging logs',
      icon: <Mail className="w-4 h-4 text-accent-cyan" />,
      action: () => openWindow('contact'),
    },
    {
      id: 'game',
      title: 'Play CyberSnake',
      subtitle: 'Boot retro 2D neon snake program',
      icon: <Gamepad2 className="w-4 h-4 text-accent-pink" />,
      action: () => openWindow('game'),
    },
    {
      id: 'browser',
      title: 'Open Web Browser',
      subtitle: 'Launch retro WebNavigator.exe browser client',
      icon: <Globe className="w-4 h-4 text-accent-green" />,
      action: () => openWindow('browser'),
    },
    {
      id: 'matrix',
      title: 'Matrix Rain Mode',
      subtitle: 'Initiate 5-second falling digital character canvas',
      icon: <ShieldAlert className="w-4 h-4 text-accent-pink" />,
      action: () => {
        toggleMatrix(true);
        addNotification('Matrix Rain protocol override engaged.', 'warning');
      },
    },
    {
      id: 'wp-neon-city',
      title: 'Wallpaper: Neon City',
      subtitle: 'Set desktop background to user-assigned cyberpunk image',
      icon: <Eye className="w-4 h-4 text-accent-violet" />,
      action: () => {
        setWallpaperStyle('neon-city');
        addNotification('Background set to Neon City.', 'info');
      },
    },
    {
      id: 'wp-grid',
      title: 'Wallpaper: Tech Grid',
      subtitle: 'Set desktop background to holographic sci-fi grid',
      icon: <Eye className="w-4 h-4 text-accent-violet" />,
      action: () => {
        setWallpaperStyle('grid');
        addNotification('Background set to Tech Grid.', 'info');
      },
    },
    {
      id: 'wp-waves',
      title: 'Wallpaper: Neon Waves',
      subtitle: 'Set desktop background to glowing grid wave ripples',
      icon: <Eye className="w-4 h-4 text-accent-violet" />,
      action: () => {
        setWallpaperStyle('neon-waves');
        addNotification('Background set to Neon Waves.', 'info');
      },
    },
    {
      id: 'wp-retro-teal',
      title: 'Wallpaper: Retro Teal (Win95)',
      subtitle: 'Set desktop background to solid Windows 95 retro teal',
      icon: <Eye className="w-4 h-4 text-accent-violet" />,
      action: () => {
        setWallpaperStyle('retro-teal');
        addNotification('Background set to Retro Teal.', 'info');
      },
    },
  ];

  // Global key listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPalette(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPalette]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isCommandPaletteOpen]);

  // Filter options based on query
  const filtered = options.filter(
    (opt) =>
      opt.title.toLowerCase().includes(query.toLowerCase()) ||
      opt.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation within the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setCommandPalette(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setCommandPalette(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh]">
          {/* Dimmed Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPalette(false)}
            className="fixed inset-0 bg-black/60"
          />

          {/* Palette Box */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            ref={containerRef}
            className="w-full max-w-lg bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-2xl overflow-hidden font-mono z-[10001] flex flex-col"
          >
            {/* Input Wrapper */}
            <div className="flex items-center border-b border-white/10 px-4 py-3 gap-3">
              <Command className="w-5 h-5 text-accent-violet animate-pulse" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands or launch applications..."
                className="bg-transparent border-0 outline-none w-full text-sm placeholder-white/30 text-white"
              />
              <span className="text-[10px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-white/40 shrink-0">
                ESC
              </span>
            </div>

            {/* Options List */}
            <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
              {filtered.length > 0 ? (
                filtered.map((opt, idx) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      opt.action();
                      setCommandPalette(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                      idx === selectedIndex
                        ? 'bg-accent-violet/25 text-white border border-accent-violet/30'
                        : 'text-white/60 border border-transparent hover:text-white'
                    }`}
                  >
                    <div className="shrink-0">{opt.icon}</div>
                    
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate">{opt.title}</span>
                      <span className="text-[10px] opacity-65 truncate mt-0.5">{opt.subtitle}</span>
                    </div>

                    {idx === selectedIndex && (
                      <span className="text-[9px] text-accent-green border border-accent-green/20 px-1 py-0.5 rounded uppercase font-semibold">
                        Enter
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-8 text-center text-xs text-white/30">
                  No commands matching query found.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/10 bg-black/20 flex justify-between items-center text-[9px] text-white/30">
              <div className="flex gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <span>Ctrl+K to toggle</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
