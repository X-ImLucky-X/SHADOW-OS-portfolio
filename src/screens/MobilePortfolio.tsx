import React, { useState, useEffect, useRef } from 'react';
import { resumeData } from '../data/resume';
import { useTelemetryStore } from '../store/telemetryStore';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Send, 
  Award, 
  Cpu, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Terminal as TerminalIcon, 
  Gamepad2, 
  Brain, 
  Volume2, 
  VolumeX, 
  Clock, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

type TabType = 'home' | 'terminal' | 'skills' | 'archive' | 'neural' | 'arcade';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isStreaming?: boolean;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = [number, number];
const SNAKE_GRID_SIZE = 15;

interface ResonancePadProps {
  soundEnabled: boolean;
  onOverloadChange?: (overloaded: boolean) => void;
}

export const ResonancePad: React.FC<ResonancePadProps> = ({ soundEnabled, onOverloadChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeOscRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  const [pointerActive, setPointerActive] = useState(false);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  const progressRef = useRef(0);
  const isOverloadedRef = useRef(false);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (activeOscRef.current) {
        try {
          activeOscRef.current.osc.stop();
          activeOscRef.current.osc.disconnect();
        } catch (e) {}
      }
    };
  }, []);

  const handlePointerStart = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    pointerRef.current = { x, y, active: true };
    setPointerActive(true);

    if (soundEnabled) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtxClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        const freq = 180 + (x / rect.width) * 580;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const vol = Math.max(0.005, (1 - y / rect.height) * 0.04);
        gain.gain.setValueAtTime(vol, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400 + (1 - y / rect.height) * 2000, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();

        activeOscRef.current = { osc, gain };
      } catch (err) {}
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!pointerRef.current.active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    pointerRef.current = { x, y, active: true };

    const oscInfo = activeOscRef.current;
    if (oscInfo && soundEnabled && !isOverloadedRef.current) {
      try {
        const freq = 180 + (x / rect.width) * 580;
        const vol = Math.max(0.005, (1 - y / rect.height) * 0.04);
        const ctx = oscInfo.osc.context;

        oscInfo.osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.03);
        oscInfo.gain.gain.setTargetAtTime(vol, ctx.currentTime, 0.03);
      } catch (err) {}
    }
  };

  const handlePointerEnd = () => {
    pointerRef.current.active = false;
    setPointerActive(false);

    const oscInfo = activeOscRef.current;
    if (oscInfo) {
      try {
        const ctx = oscInfo.osc.context;
        oscInfo.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
        setTimeout(() => {
          try {
            oscInfo.osc.stop();
            oscInfo.osc.disconnect();
          } catch (e) {}
        }, 80);
      } catch (e) {}
      activeOscRef.current = null;
    }
  };

  // Event handlers
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      if (e.cancelable) e.preventDefault();
      handlePointerStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;
    const ripples: { x: number; y: number; r: number; opacity: number }[] = [];

    const render = () => {
      phase += 0.08;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;

      const p = pointerRef.current;

      // Update engagement progress
      if (p.active) {
        progressRef.current = Math.min(100, progressRef.current + 0.65);
      } else {
        progressRef.current = Math.max(0, progressRef.current - 3.5);
      }

      const reachedOverload = progressRef.current >= 100;

      // Update overload states and trigger callback
      if (reachedOverload !== isOverloadedRef.current) {
        isOverloadedRef.current = reachedOverload;
        if (onOverloadChange) {
          onOverloadChange(reachedOverload);
        }
      }

      // Soft clear with trail depending on overload state
      if (reachedOverload) {
        ctx.fillStyle = Math.random() < 0.18 ? 'rgba(255, 0, 0, 0.22)' : 'rgba(10, 10, 15, 0.25)';
      } else {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
      }
      ctx.fillRect(0, 0, w, h);

      // Sound modulation on overload
      const oscInfo = activeOscRef.current;
      if (reachedOverload && oscInfo && soundEnabled) {
        try {
          const oscCtx = oscInfo.osc.context;
          const overloadFreq = 300 + Math.sin(phase * 6.5) * 280 + Math.random() * 80;
          oscInfo.osc.frequency.setValueAtTime(overloadFreq, oscCtx.currentTime);
          oscInfo.gain.gain.setValueAtTime(0.045, oscCtx.currentTime);
        } catch (err) {}
      }

      // Draw light green/red grid
      ctx.strokeStyle = reachedOverload ? 'rgba(255, 0, 0, 0.05)' : 'rgba(0, 245, 160, 0.04)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 16) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 12) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Ripple spawner
      if (p.active && !reachedOverload && Math.random() < 0.25) {
        ripples.push({ x: p.x, y: p.y, r: 2, opacity: 1 });
      }

      // Update and render ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 1.8;
        r.opacity -= 0.04;
        if (r.opacity <= 0) {
          ripples.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 255, ${r.opacity * 0.45})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Draw wave (chaotic lightning wave on overload, normal warped wave otherwise)
      ctx.beginPath();
      ctx.lineWidth = reachedOverload ? 3.5 : 2;
      ctx.strokeStyle = reachedOverload 
        ? (Math.random() < 0.5 ? '#ff3333' : '#ffea00') 
        : (p.active ? '#00f5a0' : 'rgba(0, 255, 0, 0.65)');
      ctx.shadowBlur = p.active ? 12 : 0;
      ctx.shadowColor = reachedOverload ? '#ff3333' : '#00f5a0';

      for (let x = 0; x < w; x++) {
        let yVal = h / 2;

        if (reachedOverload) {
          const noiseVal = (Math.random() - 0.5) * h * 0.75;
          const sinVal = Math.sin(x * 0.18 + phase * 6.5) * 18;
          yVal = h / 2 + sinVal + noiseVal;
        } else if (p.active) {
          const distance = Math.abs(x - p.x);
          const weight = Math.exp(-distance / 40); // bell width
          const baseWave = Math.sin(x * 0.045 + phase) * 5;
          const pluckWave = Math.sin(x * 0.15 - phase * 3) * 10;
          yVal = (1 - weight) * (h / 2 + baseWave) + weight * (p.y + pluckWave);
        } else {
          yVal = h / 2 + Math.sin(x * 0.035 + phase) * 7 + Math.cos(x * 0.015 + phase * 0.5) * 3;
        }

        if (x === 0) {
          ctx.moveTo(x, yVal);
        } else {
          ctx.lineTo(x, yVal);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw crosshairs and scope indicators
      if (p.active && !reachedOverload) {
        ctx.strokeStyle = 'rgba(0, 245, 160, 0.35)';
        ctx.setLineDash([3, 3]);
        
        ctx.beginPath();
        ctx.moveTo(0, p.y);
        ctx.lineTo(w, p.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p.x, 0);
        ctx.lineTo(p.x, h);
        ctx.stroke();

        ctx.setLineDash([]); // reset

        // Center dot
        ctx.fillStyle = '#00f5a0';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Target scope ring
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11 + Math.sin(phase * 2) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Overload text graphics
      if (reachedOverload) {
        ctx.fillStyle = '#ff3333';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('CRITICAL CORE TEMPERATURE BREACHED', 10, 22);
        ctx.fillText('CORONAL PLASMA DISCHARGE DETECTED', 10, 32);

        if (Math.random() < 0.45) {
          ctx.fillStyle = '#ffea00';
          for (let i = 0; i < 4; i++) {
            const rx = Math.random() * w;
            const ry = 15 + Math.random() * (h - 30);
            ctx.fillText('ERR_OVERLOAD_' + Math.floor(Math.random() * 999), rx, ry);
          }
        }
      }

      // Render system usage statistics and progress bar text directly
      ctx.font = '8px monospace';
      ctx.fillStyle = reachedOverload ? '#ff3333' : '#00f5a0';

      const sysLoad = 12 + Math.floor(progressRef.current * 0.88);
      const loadStr = reachedOverload ? 'SYS_LOAD: 100% OVERLOAD' : `SYS_LOAD: ${sysLoad}%`;
      ctx.fillText(loadStr, 10, h - 8);

      const blocks = Math.floor(progressRef.current / 10);
      const barStr = `ENGAGE: [${'|'.repeat(blocks)}${'.'.repeat(10 - blocks)}]`;
      ctx.fillText(barStr, w - 125, h - 8);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [soundEnabled]);

  return (
    <div className="w-full flex-1 min-h-[180px] border border-accent-green/35 bg-[#08080c] rounded-xl relative overflow-hidden my-3">
      <div className="absolute top-1 left-2 text-[7px] text-white/35 font-bold tracking-widest flex items-center gap-1.5 pointer-events-none select-none z-10">
        <Activity className="w-3.5 h-3.5 text-accent-green animate-pulse" />
        RESONANCE_THEREMIN_FIELD
      </div>
      {pointerActive && !isOverloadedRef.current && (
        <div className="absolute top-1 right-2 text-[6px] text-[#00f5a0] font-mono tracking-widest pointer-events-none select-none z-10 animate-pulse">
          LOCK: X_{pointerRef.current.x.toFixed(0)} Y_{pointerRef.current.y.toFixed(0)}
        </div>
      )}
      {isOverloadedRef.current && (
        <div className="absolute top-1 right-2 text-[6px] text-[#ff3333] font-mono tracking-widest pointer-events-none select-none z-10 animate-ping">
          WARNING: BREACH
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair block select-none pointer-events-auto"
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={handlePointerEnd}
        onMouseLeave={handlePointerEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handlePointerEnd}
      />
    </div>
  );
};

export const MobilePortfolio: React.FC = () => {
  const { githubData, leetcodeData, radarSkills, categorizedSkills, projects } = useTelemetryStore();
  // Navigation & Transitions
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [displayedTab, setDisplayedTab] = useState<TabType>('home');
  const [isGlitching, setIsGlitching] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);

  // Global Audio Enable
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSystemShaking, setIsSystemShaking] = useState(false);

  // Home: Time
  const [timeStr, setTimeStr] = useState('');

  // Terminal: history lines and auto-scroll
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Archive: project carousel index and decryption animation progress
  const [projectIdx, setProjectIdx] = useState(0);
  const [decryptProgress, setDecryptProgress] = useState(0);

  // Neural (AI chatbot): chat history and input
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `SHADOW_OS CORE INTELLIGENCE UPLINK LOADED.

Hello, I am the ShadowOS Assistant, loaded with Lakshya's credentials and telemetry. Tap a query key below or write a query!`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Arcade (CyberSnake): states
  const [snake, setSnake] = useState<Position[]>([[7, 7], [7, 8], [7, 9]]);
  const [food, setFood] = useState<Position>([3, 3]);
  const [snakeDir, setSnakeDir] = useState<Direction>('UP');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('shadow_os_snake_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [gameSpeed, setGameSpeed] = useState(160);

  const snakeDirRef = useRef<Direction>('UP');

  // --- 8-BIT SOUND GENERATOR ---
  const playSynthSound = (type: 'click' | 'boot' | 'eat' | 'crash' | 'pause') => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        gainNode.gain.setValueAtTime(0.015, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'boot') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.setValueAtTime(329.63, now + 0.08); // E4
        osc.frequency.setValueAtTime(392.00, now + 0.16); // G4
        osc.frequency.setValueAtTime(523.25, now + 0.24); // C5
        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'eat') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
        gainNode.gain.setValueAtTime(0.02, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.5);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'pause') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(220, now + 0.12);
        gainNode.gain.setValueAtTime(0.02, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  // --- NAVIGATION GLITCH TRIGGER ---
  const triggerTabSwitch = (newTab: TabType) => {
    if (newTab === activeTab) return;
    playSynthSound('click');
    setIsGlitching(true);
    setActiveTab(newTab);
    
    // Switch displayed page in the middle of the noise
    setTimeout(() => {
      setDisplayedTab(newTab);
    }, 200);

    setTimeout(() => {
      setIsGlitching(false);
    }, 450);
  };

  // Real-time Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Battery Level decay simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) => (prev > 5 ? prev - 1 : 100));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- TERMINAL MODULE AUTOLOAD ---
  useEffect(() => {
    if (displayedTab === 'terminal') {
      setTerminalLines([
        'SYS_OS v2.0 MOBILE UPLINK CONSOLE',
        'ESTABLISHING SHADOW MEMORY ROUTE...',
        'STATUS: CONNECTED // IP: 192.168.10.45',
        '========================================',
        'SELECT SCRIPT MACRO BELOW FOR EXTRACTION.',
        ''
      ]);
    }
  }, [displayedTab]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Command handlers
  const runTerminalCommand = (cmd: 'whoami' | 'getskills' | 'neofetch' | 'matrix' | 'clear') => {
    playSynthSound('click');
    if (cmd === 'clear') {
      setTerminalLines([]);
      return;
    }

    const commandPrints: Record<string, string[]> = {
      whoami: [
        `> run WhoAmI.exe`,
        `FETCHING TARGET METADATA...`,
        `----------------------------------------`,
        `NAME: Lakshya Kumar Singh`,
        `ROLE: AI Engineer & Full-Stack Developer`,
        `STATUS: Available for Hire / Chennai, IN`,
        `SUMMARY: B.Tech Computer Science (AI & ML) at VIT Chennai (2027) focused on building autonomous agent pipelines (LangGraph), local model orchestration (Ollama), and real-time computer vision systems.`,
        `----------------------------------------`
      ],
      getskills: [
        `> run GetSkills.bin`,
        `EXTRACTING PROFICIENCY RATINGS...`,
        `----------------------------------------`,
        ...categorizedSkills.flatMap(group => [
          `[${group.category.toUpperCase()}]`,
          `  - ${group.items.join(', ')}`
        ]),
        `----------------------------------------`
      ],
      neofetch: [
        `> run Neofetch.exe`,
        `   .---.      OS: ShadowOS Mobile v2.0`,
        `  /     \\     Host: Handheld Cyber-Console`,
        `  \\  o o/     Kernel: ARM64-v8a-6.14.0`,
        `   \\_ -_/     Uptime: 1h 23m`,
        `   //   \\     Resolution: 480x800 (tactical)`,
        `  //     \\    Shell: bash 5.2.2`,
        ` /|     | \\   CPU: Cortex-X9 NeuroCore (8x)`,
        ` \\\\_   _//    Memory: 12GB RAM LPDDR5`,
        `  \\___/       Target: Hireable (Open for Roles)`,
        `   Telemetry: Stars: ★ ${githubData.stars} // Commits: ${githubData.commits} // Solved: ${leetcodeData.solved} DSA`
      ],
      matrix: [
        `> run MatrixStream.sys`,
        `STREAMING DATA LAYER CYCLIC NODES...`,
        `10010110101011011010101001011010`,
        `01101001010101100101010110100101`,
        `10101101001010101101001010101101`,
        `01010110101001011010101001101010`,
        `STREAM DISCONNECT. ROUTE SECURED.`
      ]
    };

    const lines = commandPrints[cmd] || [];
    setTerminalLines((prev) => [...prev, ...lines, '']);
  };
  
  const handleTerminalSubmit = (cmdText: string) => {
    const raw = cmdText.trim();
    if (!raw) return;
    playSynthSound('click');
    setTerminalInput('');

    const clean = raw.toLowerCase();
    
    // Echo command
    setTerminalLines((prev) => [...prev, `> ${raw}`]);

    setTimeout(() => {
      let responseLines: string[] = [];
      if (clean === 'clear') {
        setTerminalLines([]);
        return;
      } else if (clean === 'help') {
        responseLines = [
          'AVAILABLE UTILITY DIRECTIVES:',
          '  - whoami     : PROFESSIONAL IDENT-CARD',
          '  - getskills  : CORE TECHNICAL STACK DATA',
          '  - neofetch   : SYSTEM ARCHITECTURE SPECIFICATIONS',
          '  - matrix     : SIMULATE CYCLIC DATA STREAM',
          '  - clear      : FLUSH CONSOLE TERMINAL BUFFER',
          '  - help       : DISPLAY SYSTEM USAGE UTILITIES'
        ];
      } else if (clean === 'whoami') {
        responseLines = [
          `FETCHING TARGET METADATA...`,
          `----------------------------------------`,
          `NAME: Lakshya Kumar Singh`,
          `ROLE: AI Engineer & Full-Stack Developer`,
          `STATUS: Available for Hire / Chennai, IN`,
          `SUMMARY: B.Tech Computer Science (AI & ML) at VIT Chennai (2027) focused on building autonomous agent pipelines (LangGraph), local model orchestration (Ollama), and real-time computer vision systems.`,
          `----------------------------------------`
        ];
      } else if (clean === 'getskills' || clean === 'skills') {
        responseLines = [
          `EXTRACTING PROFICIENCY RATINGS...`,
          `----------------------------------------`,
          ...categorizedSkills.flatMap(group => [
            `[${group.category.toUpperCase()}]`,
            `  - ${group.items.join(', ')}`
          ]),
          `----------------------------------------`
        ];
      } else if (clean === 'neofetch') {
        responseLines = [
          `   .---.      OS: ShadowOS Mobile v2.0`,
          `  /     \\     Host: Handheld Cyber-Console`,
          `  \\  o o/     Kernel: ARM64-v8a-6.14.0`,
          `   \\_ -_/     Uptime: 1h 23m`,
          `   //   \\     Resolution: 480x800 (tactical)`,
          `  //     \\    Shell: bash 5.2.2`,
          ` /|     | \\   CPU: Cortex-X9 NeuroCore (8x)`,
          ` \\\\_   _//    Memory: 12GB RAM LPDDR5`,
          `  \\___/       Target: Hireable (Open for Roles)`,
          `   Telemetry: Stars: ★ ${githubData.stars} // Commits: ${githubData.commits} // Solved: ${leetcodeData.solved} DSA`
        ];
      } else if (clean === 'matrix') {
        responseLines = [
          `STREAMING DATA LAYER CYCLIC NODES...`,
          `10010110101011011010101001011010`,
          `01101001010101100101010110100101`,
          `10101101001010101101001010101101`,
          `01010110101001011010101001101010`,
          `STREAM DISCONNECT. ROUTE SECURED.`
        ];
      } else {
        responseLines = [
          `ERR: COMMAND NOT FOUND: '${raw}'`,
          `TYPE 'help' FOR SYSTEM DIRECTIVE OPTIONS.`
        ];
      }

      setTerminalLines((prev) => [...prev, ...responseLines, '']);
    }, 120);
  };

  // --- ARCHIVE CAROUSEL & DECRYPTION ---
  const triggerProjectChange = (nextIndex: number) => {
    playSynthSound('click');
    setProjectIdx(nextIndex);
    // Decryption status simulation
    setDecryptProgress(0);
  };

  useEffect(() => {
    if (displayedTab === 'archive') {
      let count = 0;
      const interval = setInterval(() => {
        count += 8;
        if (count >= 100) {
          setDecryptProgress(100);
          clearInterval(interval);
        } else {
          setDecryptProgress(count);
        }
      }, 25);
      return () => clearInterval(interval);
    }
  }, [displayedTab, projectIdx]);

  // --- NEURAL BOT INFERENCE CORE ---
  const suggestedPrompts = [
    { label: 'VoxMail AI', text: 'Tell me about VoxMail AI' },
    { label: 'LeetCode Stats', text: 'What are your LeetCode stats?' },
    { label: 'Academic Logs', text: 'Show academic credentials' },
    { label: 'GDSC Work', text: 'Show GDSC experience' },
    { label: 'Uplink Info', text: 'Get contact details' }
  ];

  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase().trim();
    if (q.includes('voxmail')) {
      return `PROJECT_LOG: VoxMail AI
Category: Agentic AI
Stack: React Native, FastAPI, PostgreSQL, Supabase, Ollama, Qwen 2.5 7B.

Privacy-first offline email agent running local LLMs on-device to auto-summarize and draft responses for incoming client emails.`;
    }
    if (q.includes('leetcode') || q.includes('dsa') || q.includes('knight')) {
      const dsaLevel = leetcodeData.contestRating >= 1600 ? 'KNIGHT' : 'SPECIALIST';
      return `LEETCODE RATINGS:
Badge: LEETCODE ${dsaLevel}
Rating: ${leetcodeData.contestRating.toFixed(2)} (Top ${leetcodeData.contestTopPercentage.toFixed(2)}% globally)
Contests Attended: ${leetcodeData.contestAttend}
Solved: ${leetcodeData.solved} Problems (${leetcodeData.easySolved} Easy, ${leetcodeData.mediumSolved} Medium, ${leetcodeData.hardSolved} Hard)`;
    }
    if (q.includes('github') || q.includes('repo') || q.includes('git')) {
      return `GITHUB METRICS:
Username: X-ImLucky-X
Total Stars: ${githubData.stars}
Public Repos: ${githubData.publicRepos}
Total Commits: ${githubData.commits}
Contributions: ${githubData.contributions}
Top languages: ${githubData.languages.slice(0, 3).map(l => `${l.name} (${l.percentage.toFixed(1)}%)`).join(', ')}`;
    }
    if (q.includes('academic') || q.includes('education') || q.includes('college') || q.includes('vit')) {
      return `ACADEMICS:
1. B.Tech in CSE (AI & ML)
   VIT Chennai (Expected 2027)
   CGPA: 8.55 / 10.0
2. Class XII (CBSE) - St. Fidelis School (86.2%)
3. Class X (CBSE) - St. Fidelis School (91.2%)`;
    }
    if (q.includes('gdsc') || q.includes('experience') || q.includes('work')) {
      return `WORK TELEMETRY:
1. Google Developer Student Club (GDSC), VIT Chennai
   Role: Tech Member (2024 - Present)
2. Freelance ML Developer (2023 - Present)
   Built custom CV pipelines (YOLOv8, MediaPipe), local document agentic systems, and refactored full-stack REST API schemas.`;
    }
    if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('uplink')) {
      return `SECURE CHANNELS:
- Email: lakshyakumarsingh1@gmail.com
- Mobile: +91 89238 94012
- GitHub: github.com/X-ImLucky-X
- LinkedIn: linkedin.com/in/lakshya-kumar-singh-62142128b/`;
    }
    return `SHADOW AI RESPONSE:
Sector query not found. Try searching for:
- "VoxMail"
- "LeetCode"
- "Education"
- "Experience"
- "Contact"`;
  };

  const simulateAiStream = (replyText: string) => {
    const msgId = Math.random().toString(36).substring(2, 9);
    setChatMessages((prev) => [...prev, { id: msgId, sender: 'ai', text: '', isStreaming: true }]);
    
    let index = 0;
    let textBuffer = '';
    const interval = setInterval(() => {
      if (index >= replyText.length) {
        clearInterval(interval);
        setChatMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: replyText, isStreaming: false } : m))
        );
        setIsAiTyping(false);
      } else {
        textBuffer += replyText[index];
        setChatMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: textBuffer } : m))
        );
        index++;
      }
    }, 7);
  };

  const handleSendChat = (text: string) => {
    if (!text.trim() || isAiTyping) return;
    playSynthSound('click');
    const userMsgId = Math.random().toString(36).substring(2, 9);
    setChatMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text }]);
    setChatInput('');
    setIsAiTyping(true);

    const reply = getAIResponse(text);
    setTimeout(() => {
      simulateAiStream(reply);
    }, 350);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // --- CYBERSNAKE ARCADE MECHANICS ---
  const spawnSnakeFood = (currSnake: Position[]): Position => {
    while (true) {
      const rx = Math.floor(Math.random() * SNAKE_GRID_SIZE);
      const ry = Math.floor(Math.random() * SNAKE_GRID_SIZE);
      const onSnake = currSnake.some(([sx, sy]) => sx === rx && sy === ry);
      if (!onSnake) return [rx, ry];
    }
  };

  const startNewSnakeGame = () => {
    playSynthSound('boot');
    const initialSnake: Position[] = [[7, 7], [7, 8], [7, 9]];
    setSnake(initialSnake);
    setFood(spawnSnakeFood(initialSnake));
    setSnakeDir('UP');
    snakeDirRef.current = 'UP';
    setGameScore(0);
    setGameSpeed(160);
    setGameOver(false);
    setGameStarted(true);
  };

  const pressGamepadDirection = (dir: Direction) => {
    if (!gameStarted || gameOver) return;
    if (dir === 'UP' && snakeDir === 'DOWN') return;
    if (dir === 'DOWN' && snakeDir === 'UP') return;
    if (dir === 'LEFT' && snakeDir === 'RIGHT') return;
    if (dir === 'RIGHT' && snakeDir === 'LEFT') return;

    playSynthSound('click');
    snakeDirRef.current = dir;
    setSnakeDir(dir);
  };

  const pauseSnakeResume = () => {
    if (!gameStarted || gameOver) return;
    playSynthSound('pause');
    setGameStarted(false);
  };

  useEffect(() => {
    if (!gameStarted || gameOver || displayedTab !== 'arcade') return;

    const gameTick = () => {
      setSnake((prev) => {
        const head = prev[0];
        const nextDir = snakeDirRef.current;
        const newHead: Position = [...head];

        if (nextDir === 'UP') newHead[1] = head[1] - 1;
        else if (nextDir === 'DOWN') newHead[1] = head[1] + 1;
        else if (nextDir === 'LEFT') newHead[0] = head[0] - 1;
        else if (nextDir === 'RIGHT') newHead[0] = head[0] + 1;

        // Wall collisions
        if (
          newHead[0] < 0 ||
          newHead[0] >= SNAKE_GRID_SIZE ||
          newHead[1] < 0 ||
          newHead[1] >= SNAKE_GRID_SIZE
        ) {
          setGameOver(true);
          playSynthSound('crash');
          return prev;
        }

        // Self collision
        const bitSelf = prev.some(([sx, sy]) => sx === newHead[0] && sy === newHead[1]);
        if (bitSelf) {
          setGameOver(true);
          playSynthSound('crash');
          return prev;
        }

        const nextSnake = [newHead, ...prev];

        // Eat food collision
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          playSynthSound('eat');
          setGameScore((s) => {
            const ns = s + 10;
            if (ns > highScore) {
              setHighScore(ns);
              try {
                localStorage.setItem('shadow_os_snake_highscore', ns.toString());
              } catch {}
            }
            if (ns % 30 === 0) {
              setGameSpeed((sp) => Math.max(90, sp - 15));
            }
            return ns;
          });
          setFood(spawnSnakeFood(prev));
        } else {
          nextSnake.pop();
        }

        return nextSnake;
      });
    };

    const interval = setInterval(gameTick, gameSpeed);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, food, gameSpeed, displayedTab]);

  return (
    <div className="fixed inset-0 bg-[#050508] p-3 flex flex-col justify-between overflow-hidden select-none font-mono">
      {/* CSS Animation injection */}
      <style>{`
        @keyframes heartbeat {
          0% { stroke-dashoffset: 240; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scanline-mobile {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes glitch-noise {
          0% { clip-path: inset(10% 0 80% 0); }
          20% { clip-path: inset(80% 0 10% 0); }
          40% { clip-path: inset(30% 0 45% 0); }
          60% { clip-path: inset(50% 0 15% 0); }
          80% { clip-path: inset(12% 0 77% 0); }
          100% { clip-path: inset(75% 0 5% 0); }
        }
        @keyframes console-shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-2.5px, 0px) rotate(1deg); }
          30% { transform: translate(0px, 1.8px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 1.8px) rotate(-1deg); }
          60% { transform: translate(-2.5px, 1px) rotate(0deg); }
          70% { transform: translate(1.8px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1.8px, 1.8px) rotate(0deg); }
          100% { transform: translate(1px, -1.8px) rotate(-1deg); }
        }
        .console-shake-active {
          animation: console-shake 0.15s linear infinite !important;
        }
        @keyframes loading-bar-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-loading-bar {
          animation: loading-bar-slide 1.2s linear infinite;
        }
      `}</style>

      {/* Tactile Device Main Enclosure Frame */}
      <div className={`w-full h-full bg-[#0a0a0f] border-[3px] border-accent-green/45 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-[0_0_20px_rgba(0,128,0,0.15)] transition-transform duration-75 ${
        isSystemShaking ? 'console-shake-active font-bold border-red-500/80 shadow-[0_0_25px_rgba(255,0,0,0.3)]' : ''
      }`}>
        
        {/* Subtle hardware tactical corner tags */}
        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-accent-cyan/80 pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-accent-cyan/80 pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-accent-cyan/80 pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-accent-cyan/80 pointer-events-none" />

        {/* Battery Efficient CRT Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none z-45 overflow-hidden">
          <div className="w-full h-2.5 bg-white/[0.012] absolute top-0 left-0 animate-[scanline-mobile_6s_linear_infinite]" />
          <div 
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1.5px, #000 1.5px, #000 3px)'
            }}
          />
        </div>

        {/* --- DOCK CHANNEL CHANGE GLITCH OVERLAY --- */}
        {isGlitching && (
          <div className="absolute inset-0 bg-[#060609] z-50 flex flex-col items-center justify-center font-mono pointer-events-none select-none">
            {/* SVG procedural white noise grid overlay */}
            <div className="absolute inset-0 opacity-[0.12]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }} />
            <div className="text-center font-pixel text-lg text-accent-green tracking-widest flex flex-col items-center gap-3">
              <span className="animate-pulse text-red-500 font-bold">&lt; SYS_CHANNEL_TUNING &gt;</span>
              <div className="w-24 h-1 bg-accent-green/30 rounded overflow-hidden relative">
                <div className="h-full bg-accent-green animate-loading-bar w-1/3 absolute top-0 left-0" />
              </div>
              <span className="text-[9px] text-[#00ff00]/40 font-mono tracking-normal">DECRYPTING MODULE: {activeTab.toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* 1. TOP RETRO STATUS BAR */}
        <header className="h-10 border-b border-accent-green/35 bg-[#0e0e15] px-3 flex justify-between items-center shrink-0 text-[9px] text-accent-green/90 tracking-tight select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-ping" />
            <span className="font-bold tracking-wider">SYS_STATUS: ONLINE</span>
          </div>
          
          <div className="hidden min-[370px]:block text-accent-cyan/85">
            SECURE_LINK
          </div>

          <div className="flex items-center gap-2">
            <span>BATT: {batteryLevel}%</span>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-accent-green" /> : <VolumeX className="w-3.5 h-3.5 text-white/30" />}
            </button>
          </div>
        </header>

        {/* 2. CENTRAL VIEWPORT TERMINAL BOX */}
        <main className="flex-1 w-full p-3 bg-[#030305] relative overflow-y-auto scrollbar-none flex flex-col">
          
          {/* HOME.SYS */}
          {displayedTab === 'home' && (
            <div className="flex-1 flex flex-col justify-between py-1 min-h-full select-text">
              {/* Digital Clock */}
              <div className="text-center flex flex-col items-center pt-2 shrink-0">
                <span className="text-[10px] text-accent-cyan/60 font-bold tracking-widest uppercase">REAL_TIME_UPLINK</span>
                <h1 className="text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 font-pixel mt-1 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
                  {timeStr || '12:00:00'}
                </h1>
              </div>

              {/* Interactive Resonance Theremin Pad */}
              {/* Interactive Resonance Theremin Pad */}
              <ResonancePad soundEnabled={soundEnabled} onOverloadChange={setIsSystemShaking} />

              {/* Telemetry Grid */}
              <div className="grid grid-cols-3 gap-2.5 my-2 shrink-0">
                <div className="border border-accent-violet/30 bg-accent-violet/5 p-2 rounded-lg text-center flex flex-col justify-center">
                  <span className="text-[7px] text-white/40 tracking-wider font-bold">PROJECTS</span>
                  <span className="text-sm font-black text-accent-cyan font-pixel mt-0.5">{projects.length} BUILT</span>
                </div>
                <div className="border border-accent-pink/30 bg-accent-pink/5 p-2 rounded-lg text-center flex flex-col justify-center">
                  <span className="text-[7px] text-white/40 tracking-wider font-bold">DSA LEVEL</span>
                  <span className="text-sm font-black text-accent-pink font-pixel mt-0.5">
                    {leetcodeData.contestRating >= 1600 ? 'KNIGHT' : 'SPECIALIST'}
                  </span>
                </div>
                <div className="border border-accent-green/30 bg-accent-green/5 p-2 rounded-lg text-center flex flex-col justify-center">
                  <span className="text-[7px] text-white/40 tracking-wider font-bold">HIRE_STATUS</span>
                  <span className="text-sm font-black text-accent-green font-pixel mt-0.5">AVAILABLE</span>
                </div>
              </div>

              {/* Quick Launch Chip Keys */}
              <div className="mt-4 shrink-0">
                <span className="text-[8px] text-white/30 tracking-widest uppercase font-bold pl-1 block mb-2">QUICK_LAUNCH_CHIPS</span>
                <div className="grid grid-cols-3 gap-2 select-none">
                  <a
                    href={resumeData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playSynthSound('click')}
                    className="bg-[#0b0c15] border border-accent-cyan/35 rounded-xl py-3 flex flex-col items-center gap-1.5 text-accent-cyan shadow-[0_0_6px_rgba(0,128,255,0.1)] active:bg-accent-cyan/10 active:translate-y-0.5 transition-all"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span className="text-[8px] font-bold">LINKEDIN</span>
                  </a>

                  <a
                    href={resumeData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playSynthSound('click')}
                    className="bg-[#0b0c15] border border-accent-pink/35 rounded-xl py-3 flex flex-col items-center gap-1.5 text-accent-pink shadow-[0_0_6px_rgba(255,0,255,0.1)] active:bg-accent-pink/10 active:translate-y-0.5 transition-all"
                  >
                    <Github className="w-5 h-5" />
                    <span className="text-[8px] font-bold">GITHUB</span>
                  </a>

                  <a
                    href={`mailto:${resumeData.email}`}
                    onClick={() => playSynthSound('click')}
                    className="bg-[#0b0c15] border border-accent-green/35 rounded-xl py-3 flex flex-col items-center gap-1.5 text-accent-green shadow-[0_0_6px_rgba(0,255,0,0.1)] active:bg-accent-green/10 active:translate-y-0.5 transition-all"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-[8px] font-bold">CONTACT</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TERMINAL.EXE */}
          {displayedTab === 'terminal' && (
            <div className="flex-1 flex flex-col justify-between min-h-full font-mono text-xs select-text">
              {/* Output log */}
              <div className="flex-1 overflow-y-auto p-2 bg-[#020203] border border-[#00ff00]/15 rounded-lg text-[#00ff00] h-[180px] min-h-[140px] scrollbar-none flex flex-col gap-1 shrink-0">
                {terminalLines.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-tight break-all">
                    {line}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Command Input Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTerminalSubmit(terminalInput);
                }}
                className="mt-3 flex gap-2 items-stretch select-none shrink-0"
              >
                <span className="text-[#00ff00] flex items-center pl-1 font-bold font-mono">&gt;</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Type command (e.g. 'help')..."
                  className="flex-1 bg-black border border-[#00ff00]/25 rounded text-[#00ff00] px-2.5 py-1 text-xs outline-none focus:border-[#00ff00] font-mono"
                />
                <button
                  type="submit"
                  disabled={!terminalInput.trim()}
                  className="bg-[#111] border border-[#00ff00]/30 hover:border-[#00ff00] text-[#00ff00] px-3 py-1 rounded text-[10px] font-bold active:bg-[#00ff00]/10 flex items-center justify-center font-mono disabled:opacity-40"
                >
                  SEND
                </button>
              </form>

              {/* Executable Macros row */}
              <div className="mt-4 pt-2 border-t border-[#00ff00]/10 flex flex-wrap gap-2 justify-center select-none shrink-0">
                <button
                  onClick={() => runTerminalCommand('whoami')}
                  className="bg-[#111] border border-[#00ff00]/30 hover:border-[#00ff00] text-[#00ff00] px-2.5 py-1.5 rounded text-[10px] font-bold active:bg-[#00ff00]/10"
                >
                  [Run WhoAmI]
                </button>
                <button
                  onClick={() => runTerminalCommand('getskills')}
                  className="bg-[#111] border border-[#00ff00]/30 hover:border-[#00ff00] text-[#00ff00] px-2.5 py-1.5 rounded text-[10px] font-bold active:bg-[#00ff00]/10"
                >
                  [Run GetSkills]
                </button>
                <button
                  onClick={() => runTerminalCommand('neofetch')}
                  className="bg-[#111] border border-[#00ff00]/30 hover:border-[#00ff00] text-[#00ff00] px-2.5 py-1.5 rounded text-[10px] font-bold active:bg-[#00ff00]/10"
                >
                  [Run Neofetch]
                </button>
                <button
                  onClick={() => runTerminalCommand('matrix')}
                  className="bg-[#111] border border-[#00ff00]/30 hover:border-[#00ff00] text-[#00ff00] px-2.5 py-1.5 rounded text-[10px] font-bold active:bg-[#00ff00]/10"
                >
                  [Matrix Rain]
                </button>
                <button
                  onClick={() => runTerminalCommand('clear')}
                  className="bg-[#111] border border-red-500/30 text-red-400 hover:border-red-500 px-2.5 py-1.5 rounded text-[10px] font-bold active:bg-red-500/10"
                >
                  [Clear]
                </button>
              </div>
            </div>
          )}

          {/* SKILLS.SYS */}
          {displayedTab === 'skills' && (() => {
            const cx = 100;
            const cy = 100;
            const maxRadius = 70;

            const getCoordinates = (index: number, value: number) => {
              const angleRad = (Math.PI / 180) * (-90 + index * 72);
              const radius = (value / 100) * maxRadius;
              const x = cx + radius * Math.cos(angleRad);
              const y = cy + radius * Math.sin(angleRad);
              return { x, y };
            };

            const pentagonGrids = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale, gridIdx) => {
              const points = Array.from({ length: 5 }).map((_, i) => {
                const p = getCoordinates(i, scale * 100);
                return `${p.x},${p.y}`;
              }).join(' ');
              return <polygon key={gridIdx} points={points} fill="none" stroke="rgba(0, 245, 160, 0.2)" strokeWidth="0.75" />;
            });

            const skillPoints = radarSkills.map((d, i) => getCoordinates(i, d.value));
            const skillPolygonPath = skillPoints.map(p => `${p.x},${p.y}`).join(' ');

            const labels = radarSkills.map((d, i) => {
              const p = getCoordinates(i, 116);
              let anchor = 'middle';
              if (i === 1 || i === 2) anchor = 'start';
              if (i === 3 || i === 4) anchor = 'end';
              return (
                <text
                  key={i}
                  x={p.x}
                  y={p.y + 4}
                  fill="#00f5a0"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor={anchor}
                  className="font-pixel"
                >
                  {d.subject}
                </text>
              );
            });

            const renderMeter = (value: number) => {
              const totalBlocks = 10;
              const filledBlocks = Math.round((value / 100) * totalBlocks);
              return '[' + '■'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks) + ']';
            };

            return (
              <div className="flex-1 flex flex-col gap-4 select-text pb-4 animate-[fadeIn_0.3s_ease-out]">
                {/* Title details */}
                <div className="w-full flex justify-between items-center text-[9px] uppercase border-b border-accent-cyan/20 pb-1 shrink-0 select-none">
                  <span className="text-accent-cyan">SYS // RADAR_TELEMETRY</span>
                  <span className="animate-pulse text-accent-green">STATUS: ACTIVE</span>
                </div>

                {/* Interactive/Rotating SVG Radar Scope */}
                <div className="flex flex-col items-center justify-center bg-[#070814]/75 border border-accent-cyan/25 rounded-xl p-3 relative h-[210px] shrink-0 select-none overflow-hidden">
                  <span className="absolute top-1.5 left-3 text-[7px] text-white/30 tracking-wider font-bold">RADAR TELEMETRY SCOPE</span>
                  
                  <svg className="w-full h-full max-w-[190px] max-h-[190px]" viewBox="0 0 200 200">
                    {/* concentric pentagons */}
                    {pentagonGrids}

                    {/* spoke lines */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const outer = getCoordinates(i, 100);
                      return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(0, 245, 160, 0.2)" strokeWidth="1" />;
                    })}

                    {/* Rotating sweep line and fading wedge using CSS rotate animation */}
                    <g className="animate-[spin_6s_linear_infinite]" style={{ transformOrigin: '100px 100px' }}>
                      <line x1={cx} y1={cy} x2={cx} y2={cy - maxRadius} stroke="rgba(0, 245, 160, 0.45)" strokeWidth="1.5" strokeDasharray="2 1" />
                      <polygon points="100,100 100,30 85,32 70,36 57,43 100,100" fill="rgba(0, 245, 160, 0.04)" />
                    </g>

                    {/* filled skill polygon */}
                    <polygon
                      points={skillPolygonPath}
                      fill="rgba(0, 245, 160, 0.18)"
                      stroke="#00f5a0"
                      strokeWidth="2"
                    />

                    {/* skill vertex dots */}
                    {skillPoints.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="#00f5a0" strokeWidth="2" />
                    ))}

                    {/* labels */}
                    {labels}
                  </svg>
                </div>

                {/* Core Target Metrics with block progress meters */}
                <div className="bg-[#070814]/75 border border-accent-cyan/20 rounded-xl p-3.5 flex flex-col gap-3 shrink-0">
                  <span className="text-[9px] text-white/40 tracking-wider font-bold uppercase select-none border-b border-white/5 pb-1">
                    CORE TARGET METRICS
                  </span>
                  <div className="flex flex-col gap-2.5">
                    {radarSkills.map((skill) => (
                      <div key={skill.subject} className="flex flex-col gap-0.5 font-mono text-[10px]">
                        <div className="flex justify-between font-bold text-white/90">
                          <span className="text-accent-cyan">{skill.subject}</span>
                          <span>{skill.value}%</span>
                        </div>
                        <span className="text-accent-green font-bold tracking-widest leading-none text-xs">
                          {renderMeter(skill.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categorized Technical System Index as cyber-cards */}
                <div className="flex flex-col gap-3 shrink-0">
                  <span className="text-[9px] text-white/30 tracking-widest font-bold uppercase select-none text-center block py-1">
                    --- CATEGORIZED TECHNICAL SYSTEM INDEX ---
                  </span>
                  {categorizedSkills.map((group) => (
                    <div 
                      key={group.category}
                      className="bg-[#070814]/80 border border-accent-cyan/25 rounded-xl p-3 shadow-inner"
                    >
                      <h4 className="text-[10px] font-bold text-accent-cyan border-b border-accent-cyan/20 pb-1.5 mb-2.5 uppercase tracking-wide">
                        {group.category}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <span 
                            key={item}
                            className="text-[9px] font-mono font-bold bg-accent-cyan/5 border border-accent-cyan/20 text-cyan-200 px-2 py-0.5 rounded-md hover:bg-accent-cyan/15 transition-colors select-all"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ARCHIVE.BIN */}
          {displayedTab === 'archive' && (
            <div className="flex-1 flex flex-col justify-between min-h-full select-text">
              {/* Page header */}
              <div className="flex justify-between items-center px-1 shrink-0">
                <span className="text-[8px] text-white/30 tracking-widest font-bold uppercase">ARCHIVE_DATA_PACKETS</span>
                <span className="text-[9px] text-accent-pink font-bold font-pixel">PACKET {projectIdx + 1}/{projects.length}</span>
              </div>

              {/* Decrypting Status bar */}
              <div className="w-full bg-[#111] border border-accent-pink/20 rounded-md p-1.5 my-2 shrink-0 select-none">
                <div className="flex justify-between text-[8px] font-mono text-accent-pink mb-1">
                  <span>DECRYPTING PACKET_METRICS...</span>
                  <span>{decryptProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-900 rounded overflow-hidden">
                  <div 
                    className="h-full bg-accent-pink transition-all duration-75"
                    style={{ width: `${decryptProgress}%` }}
                  />
                </div>
              </div>

              {/* Swipable stack of cards */}
              <div className="flex-1 flex items-center justify-center relative my-2 h-[220px] min-h-[220px] shrink-0">
                {projects.map((project, idx) => {
                  const isActive = idx === projectIdx;
                  if (!isActive) return null;

                  return (
                    <div 
                      key={project.id}
                      className="w-full bg-[#0a0b12] border-2 border-accent-pink/30 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-[0_0_12px_rgba(240,0,184,0.15)] transition-all animate-[fadeIn_0.3s_ease-out]"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-bold text-white leading-tight">{project.title}</h3>
                            {project.stars !== undefined && project.stars > 0 && (
                              <span className="text-[8px] text-accent-pink font-mono block mt-0.5">★ {project.stars} GitHub Stars</span>
                            )}
                          </div>
                          <span className="text-[7px] font-mono uppercase bg-accent-pink/15 text-accent-pink px-1.5 py-0.5 rounded border border-accent-pink/20">
                            {project.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-normal font-sans">
                          {project.shortDesc}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 my-1">
                        {project.tech.slice(0, 4).map((t) => (
                          <span 
                            key={t}
                            className="text-[8px] font-mono border border-accent-cyan/20 bg-accent-cyan/5 text-accent-cyan px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-3 select-none text-[9px] font-mono">
                        <a 
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => playSynthSound('click')}
                          className="flex items-center gap-1 text-white/40 hover:text-white"
                        >
                          <Github className="w-3.5 h-3.5" />
                          GITHUB
                        </a>

                        {project.demo && (
                          <a 
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playSynthSound('click')}
                            className="flex items-center gap-1 text-accent-cyan"
                          >
                            <Play className="w-3 h-3 fill-accent-cyan" />
                            LIVE_DEMO
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cyclic Carousel buttons */}
              <div className="flex justify-between gap-4 mt-2 select-none shrink-0">
                <button
                  onClick={() => triggerProjectChange(projectIdx > 0 ? projectIdx - 1 : projects.length - 1)}
                  className="flex-1 bg-[#111] border border-white/10 rounded-xl py-2.5 flex items-center justify-center gap-1 text-[10px] text-white/50 hover:text-white active:bg-white/5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  PREV PACKET
                </button>
                <button
                  onClick={() => triggerProjectChange(projectIdx < projects.length - 1 ? projectIdx + 1 : 0)}
                  className="flex-1 bg-[#111] border border-white/10 rounded-xl py-2.5 flex items-center justify-center gap-1 text-[10px] text-white/50 hover:text-white active:bg-white/5"
                >
                  NEXT PACKET
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* NEURAL.NET */}
          {displayedTab === 'neural' && (
            <div className="flex-1 flex flex-col justify-between min-h-full select-text">
              {/* Header */}
              <div className="flex justify-between items-center px-1 shrink-0 pb-1.5">
                <span className="text-[8px] text-white/30 tracking-widest font-bold uppercase">NEURAL_ASSISTANT_UPLINK</span>
                <span className="text-[8px] text-[#00ff00] font-bold">READY</span>
              </div>

              {/* Chat View with scanner brackets */}
              <div className="flex-1 overflow-y-auto p-3 bg-[#030305] border border-accent-cyan/25 rounded-lg text-xs scrollbar-none flex flex-col gap-3 h-[180px] min-h-[160px] relative shrink-0">
                {/* Corner accent bracket markers */}
                <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-accent-cyan pointer-events-none" />
                <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-accent-cyan pointer-events-none" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-accent-cyan pointer-events-none" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-accent-cyan pointer-events-none" />

                {chatMessages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-0.5">
                    <span className={`text-[8px] font-bold ${msg.sender === 'user' ? 'text-accent-cyan' : 'text-accent-green'}`}>
                      {msg.sender === 'user' ? 'CLIENT_SHELL' : 'SHADOW_AI'}
                    </span>
                    <p className={`leading-normal whitespace-pre-wrap ${msg.sender === 'user' ? 'text-cyan-100' : 'text-green-200'}`}>
                      {msg.text}
                      {msg.isStreaming && <span className="inline-block w-1.5 h-3 bg-accent-green animate-pulse ml-0.5" />}
                    </p>
                  </div>
                ))}
                {isAiTyping && !chatMessages[chatMessages.length - 1]?.isStreaming && (
                  <div className="flex items-center gap-1.5 text-accent-green text-[9px] animate-pulse">
                    <span>PROCESSING TRANSCEIVER SIGNAL...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggested mechanical keys deck */}
              <div className="my-2.5 overflow-x-auto whitespace-nowrap flex gap-2 select-none py-1 scrollbar-none shrink-0">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSendChat(p.text)}
                    disabled={isAiTyping}
                    className="inline-block border border-accent-cyan/40 bg-[#10121d] text-accent-cyan text-[9px] font-bold px-3 py-1.5 rounded-md active:bg-accent-cyan/15 active:translate-y-0.5 disabled:opacity-40 shadow-sm"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Chat Send Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat(chatInput);
                }}
                className="flex gap-2 items-stretch select-none shrink-0"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isAiTyping}
                  placeholder="Query (e.g. 'skills', 'VoxMail')..."
                  className="flex-1 bg-black border border-white/10 rounded-lg text-white px-3 py-2 text-xs outline-none focus:border-accent-cyan font-mono"
                />
                <button
                  type="submit"
                  disabled={isAiTyping || !chatInput.trim()}
                  className="bg-[#111] border border-accent-cyan/40 rounded-lg text-accent-cyan px-4 py-2 flex items-center justify-center active:bg-accent-cyan/10 disabled:opacity-45"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ARCADE.SYS */}
          {displayedTab === 'arcade' && (
            <div className="flex-1 flex flex-col justify-between min-h-full">
              {/* Top Half: LCD SCREEN */}
              <div className="w-full bg-[#1e1f24] rounded-xl p-2 select-none border-2 border-neutral-700 flex flex-col items-center shrink-0">
                <div className="flex justify-between w-full text-[7px] text-white/40 mb-1 px-1 font-bold">
                  <span>DOT MATRIX LCD GRID</span>
                  <span className="text-accent-green font-pixel text-[8px]">SCORE: {gameScore} // HI: {highScore}</span>
                </div>

                <div className="w-full bg-[#9bbc0f] border-2 border-[#0f380f] p-0.5 relative flex items-center justify-center">
                  <div 
                    className="grid bg-[#9bbc0f]"
                    style={{
                      gridTemplateColumns: `repeat(${SNAKE_GRID_SIZE}, minmax(0, 1fr))`,
                      width: '180px',
                      height: '180px',
                    }}
                  >
                    {Array.from({ length: SNAKE_GRID_SIZE * SNAKE_GRID_SIZE }).map((_, idx) => {
                      const x = idx % SNAKE_GRID_SIZE;
                      const y = Math.floor(idx / SNAKE_GRID_SIZE);

                      const isHead = snake[0][0] === x && snake[0][1] === y;
                      const isBody = snake.slice(1).some(([sx, sy]) => sx === x && sy === y);
                      const isFood = food[0] === x && food[1] === y;

                      return (
                        <div
                          key={idx}
                          className={`w-full h-full border-[0.2px] border-[#0f380f]/5 ${
                            isHead
                              ? 'bg-[#0f380f] rounded-sm'
                              : isBody
                              ? 'bg-[#0f380f]/80'
                              : isFood
                              ? 'bg-[#0f380f] rounded-full scale-[0.75] animate-pulse'
                              : ''
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Pause / Game Over overlays */}
                  {(!gameStarted || gameOver) && (
                    <div className="absolute inset-0 bg-[#9bbc0f]/95 flex flex-col items-center justify-center gap-1.5 text-center text-[#0f380f]">
                      {gameOver ? (
                        <>
                          <span className="text-xs font-bold font-pixel tracking-wider uppercase">CORE COLLISION</span>
                          <span className="text-[8px] font-bold">FINAL SCORE: {gameScore}</span>
                          <span className="text-[7px] opacity-75 mt-0.5 uppercase">PRESS START KEY TO RELOAD</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-bold font-pixel tracking-widest uppercase">STANDBY</span>
                          <span className="text-[7px] opacity-80 leading-tight">PRESS START (A) TO BEGIN</span>
                          <span className="text-[7px] opacity-80">STEER VIA CONTROLLER PAD</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Half: CONTROLLER OVERLAY */}
              <div className="flex-1 w-full flex items-center justify-between mt-3 px-1 gap-2 select-none shrink-0">
                {/* 1. D-PAD */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  {/* Cross Bars */}
                  <div className="absolute w-28 h-9 bg-[#24252b] rounded-lg shadow-inner border border-white/5" />
                  <div className="absolute w-9 h-28 bg-[#24252b] rounded-lg shadow-inner border border-white/5" />
                  <div className="absolute w-9 h-9 bg-[#1a1b20] rounded-full z-10 border border-white/5 flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#111] rounded-full" />
                  </div>

                  {/* Steering triggers */}
                  <button 
                    type="button"
                    onClick={() => pressGamepadDirection('UP')}
                    className="absolute top-0 left-9 w-9 h-9 active:bg-neutral-800 text-neutral-400 font-bold active:text-white rounded-t-lg z-20 flex items-center justify-center text-xs outline-none"
                    aria-label="Up"
                  >
                    ▲
                  </button>
                  <button 
                    type="button"
                    onClick={() => pressGamepadDirection('DOWN')}
                    className="absolute bottom-0 left-9 w-9 h-9 active:bg-neutral-800 text-neutral-400 font-bold active:text-white rounded-b-lg z-20 flex items-center justify-center text-xs outline-none"
                    aria-label="Down"
                  >
                    ▼
                  </button>
                  <button 
                    type="button"
                    onClick={() => pressGamepadDirection('LEFT')}
                    className="absolute left-0 top-9 w-9 h-9 active:bg-neutral-800 text-neutral-400 font-bold active:text-white rounded-l-lg z-20 flex items-center justify-center text-xs outline-none"
                    aria-label="Left"
                  >
                    ◀
                  </button>
                  <button 
                    type="button"
                    onClick={() => pressGamepadDirection('RIGHT')}
                    className="absolute right-0 top-9 w-9 h-9 active:bg-neutral-800 text-neutral-400 font-bold active:text-white rounded-r-lg z-20 flex items-center justify-center text-xs outline-none"
                    aria-label="Right"
                  >
                    ▶
                  </button>
                </div>

                {/* 2. A / B ROUND MECHANICAL BUTTONS */}
                <div className="relative w-28 h-12 bg-black/25 rounded-full rotate-[-8deg] flex items-center justify-between px-2.5 py-0.5 border border-white/5 shrink-0">
                  {/* B button */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={pauseSnakeResume}
                      className="w-10 h-10 bg-red-800 active:bg-red-950 border-2 border-red-950 rounded-full active:translate-y-0.5 shadow-md flex items-center justify-center font-bold text-white/50 active:text-white text-[10px] outline-none"
                    >
                      B
                    </button>
                    <span className="text-[6px] font-bold text-white/40 mt-0.5 uppercase">PAUSE</span>
                  </div>

                  {/* A button */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={startNewSnakeGame}
                      className="w-10 h-10 bg-red-800 active:bg-red-950 border-2 border-red-950 rounded-full active:translate-y-0.5 shadow-md flex items-center justify-center font-bold text-white/50 active:text-white text-[10px] outline-none"
                    >
                      A
                    </button>
                    <span className="text-[6px] font-bold text-white/40 mt-0.5 uppercase">START</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* 3. TACTILE BOTTOM NAVIGATION DOCK */}
        <footer className="h-16 border-t border-accent-green/35 bg-[#0a0a0f] grid grid-cols-6 p-1 select-none shrink-0">
          
          <button 
            type="button"
            onClick={() => triggerTabSwitch('home')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent transition-all ${
              activeTab === 'home' 
                ? 'border-accent-cyan/40 bg-accent-cyan/5 text-accent-cyan shadow-[0_0_8px_rgba(0,128,255,0.15)]' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-[7px] font-bold">Home.sys</span>
          </button>

          <button 
            type="button"
            onClick={() => triggerTabSwitch('skills')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent transition-all ${
              activeTab === 'skills' 
                ? 'border-accent-cyan/40 bg-accent-cyan/5 text-accent-cyan shadow-[0_0_8px_rgba(0,128,255,0.15)]' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span className="text-[7px] font-bold">Skills.sys</span>
          </button>

          <button 
            type="button"
            onClick={() => triggerTabSwitch('terminal')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent transition-all ${
              activeTab === 'terminal' 
                ? 'border-accent-green/40 bg-accent-green/5 text-accent-green shadow-[0_0_8px_rgba(0,255,0,0.15)]' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <TerminalIcon className="w-4 h-4" />
            <span className="text-[7px] font-bold">Term.exe</span>
          </button>

          <button 
            type="button"
            onClick={() => triggerTabSwitch('archive')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent transition-all ${
              activeTab === 'archive' 
                ? 'border-accent-pink/40 bg-accent-pink/5 text-accent-pink shadow-[0_0_8px_rgba(240,0,184,0.15)]' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-[7px] font-bold">Arch.bin</span>
          </button>

          <button 
            type="button"
            onClick={() => triggerTabSwitch('neural')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent transition-all ${
              activeTab === 'neural' 
                ? 'border-accent-cyan/40 bg-accent-cyan/5 text-accent-cyan shadow-[0_0_8px_rgba(0,128,255,0.15)]' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span className="text-[7px] font-bold">Neural.net</span>
          </button>

          <button 
            type="button"
            onClick={() => triggerTabSwitch('arcade')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent transition-all ${
              activeTab === 'arcade' 
                ? 'border-accent-pink/40 bg-accent-pink/5 text-accent-pink shadow-[0_0_8px_rgba(240,0,184,0.15)]' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="text-[7px] font-bold">Arcade.sys</span>
          </button>

        </footer>

      </div>
    </div>
  );
};

export default MobilePortfolio;
