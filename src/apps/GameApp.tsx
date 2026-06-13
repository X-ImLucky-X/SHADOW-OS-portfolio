import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Trophy, Power, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = [number, number];
type CasingColor = 'atomic-purple' | 'classic-gray' | 'cyberpunk' | 'hot-pink';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150; // ms per tick

export const GameApp: React.FC = () => {
  const { addNotification } = useNotificationStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Console power and casing style states
  const [powerOn, setPowerOn] = useState(true);
  const [bootStage, setBootStage] = useState<'off' | 'scrolling' | 'ready'>('ready');
  const [casing, setCasing] = useState<CasingColor>('atomic-purple');
  const [isMuted, setIsMuted] = useState(false);

  // Game state
  const [snake, setSnake] = useState<Position[]>([
    [10, 10],
    [10, 11],
    [10, 12],
  ]);
  const [food, setFood] = useState<Position>([5, 5]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('shadow_os_snake_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // Direction ref to prevent double-press turn bugs in a single tick
  const directionRef = useRef<Direction>('UP');

  // Spawn food at a random position not occupied by the snake
  const spawnFood = (currentSnake: Position[]): Position => {
    while (true) {
      const rx = Math.floor(Math.random() * GRID_SIZE);
      const ry = Math.floor(Math.random() * GRID_SIZE);
      const onSnake = currentSnake.some(([sx, sy]) => sx === rx && sy === ry);
      if (!onSnake) {
        return [rx, ry];
      }
    }
  };

  // 8-Bit Web Audio API Sound Synthesizer
  const playSound = (type: 'click' | 'boot' | 'eat' | 'crash' | 'pause') => {
    if (isMuted) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        // Simple fast low beep for clicks
        osc.type = 'square';
        osc.frequency.setValueAtTime(330, now); // E4 note
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'boot') {
        // Classic Game Boy double-tone coin sound (arpeggio)
        osc.type = 'square';
        osc.frequency.setValueAtTime(370, now); // F#4
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.setValueAtTime(0.03, now + 0.08);
        
        // Secondary tone
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'square';
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(740, now + 0.08); // F#5
        gain2.gain.setValueAtTime(0.03, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc.start(now);
        osc.stop(now + 0.08);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.55);
      } else if (type === 'eat') {
        // Sweet ascending 8-bit chord
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.07); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.14); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.21); // C6
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'crash') {
        // Low frequency noise-like rumble
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.55);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'pause') {
        // Two tone pause alert
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(440.00, now + 0.1); // A4
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Browser audio restrictions fallback
    }
  };

  // Handle Power On/Off switches
  const togglePower = () => {
    if (powerOn) {
      // Turning off
      setPowerOn(false);
      setBootStage('off');
      setIsStarted(false);
      setIsGameOver(false);
    } else {
      // Turning on -> Boot animation
      setPowerOn(true);
      setBootStage('scrolling');
      playSound('boot');
      
      setTimeout(() => {
        setBootStage('ready');
        startGame();
      }, 1800);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!powerOn || bootStage !== 'ready') return;
    let nextDir: Direction | null = null;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (direction !== 'DOWN') nextDir = 'UP';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (direction !== 'UP') nextDir = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (direction !== 'RIGHT') nextDir = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (direction !== 'LEFT') nextDir = 'RIGHT';
        break;
      case ' ':
        e.preventDefault();
        handlePauseToggle();
        break;
      default:
        return;
    }

    if (nextDir) {
      e.preventDefault();
      playSound('click');
      directionRef.current = nextDir;
      setDirection(nextDir);
    }
  };

  const handlePauseToggle = () => {
    if (!powerOn || bootStage !== 'ready' || isGameOver) return;
    playSound('pause');
    setIsStarted(prev => !prev);
  };

  // Start the game
  const startGame = () => {
    if (!powerOn) return;
    const initialSnake: Position[] = [
      [10, 10],
      [10, 11],
      [10, 12],
    ];
    setSnake(initialSnake);
    setFood(spawnFood(initialSnake));
    directionRef.current = 'UP';
    setDirection('UP');
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setIsStarted(true);
    playSound('click');
    containerRef.current?.focus();
  };

  // Game Loop tick
  useEffect(() => {
    if (!powerOn || !isStarted || isGameOver || bootStage !== 'ready') return;

    const gameTick = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        const newHead: Position = [...head];

        switch (currentDir) {
          case 'UP':
            newHead[1] = head[1] - 1;
            break;
          case 'DOWN':
            newHead[1] = head[1] + 1;
            break;
          case 'LEFT':
            newHead[0] = head[0] - 1;
            break;
          case 'RIGHT':
            newHead[0] = head[0] + 1;
            break;
        }

        // Wall collisions
        if (
          newHead[0] < 0 ||
          newHead[0] >= GRID_SIZE ||
          newHead[1] < 0 ||
          newHead[1] >= GRID_SIZE
        ) {
          setIsGameOver(true);
          playSound('crash');
          addNotification('SYSTEM SHUTDOWN: Firewall collision.', 'error');
          return prevSnake;
        }

        // Self collisions
        const bitSelf = prevSnake.some(([sx, sy]) => sx === newHead[0] && sy === newHead[1]);
        if (bitSelf) {
          setIsGameOver(true);
          playSound('crash');
          addNotification('SYSTEM OVERFLOW: Memory loop collision.', 'error');
          return prevSnake;
        }

        const nextSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          playSound('eat');
          setScore((s) => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('shadow_os_snake_highscore', nextScore.toString());
            }
            // Scale speed up slightly every 30 points
            if (nextScore % 30 === 0) {
              setSpeed((sp) => Math.max(80, sp - 10));
              addNotification(`OVERCLOCK: Core frequency raised!`, 'info');
            }
            return nextScore;
          });
          setFood(spawnFood(prevSnake));
        } else {
          // Remove tail if didn't eat
          nextSnake.pop();
        }

        return nextSnake;
      });
    };

    const interval = setInterval(gameTick, speed);
    return () => clearInterval(interval);
  }, [powerOn, isStarted, isGameOver, food, speed, highScore, bootStage]);

  // Assist focusing
  useEffect(() => {
    containerRef.current?.focus();
  }, [powerOn]);

  const cycleCasing = () => {
    playSound('click');
    const casings: CasingColor[] = ['atomic-purple', 'classic-gray', 'cyberpunk', 'hot-pink'];
    const nextIdx = (casings.indexOf(casing) + 1) % casings.length;
    setCasing(casings[nextIdx]);
  };

  const pressDirection = (dir: Direction) => {
    if (!powerOn || bootStage !== 'ready' || isGameOver || !isStarted) return;
    
    // Ignore opposite turns
    if (dir === 'UP' && direction === 'DOWN') return;
    if (dir === 'DOWN' && direction === 'UP') return;
    if (dir === 'LEFT' && direction === 'RIGHT') return;
    if (dir === 'RIGHT' && direction === 'LEFT') return;

    playSound('click');
    directionRef.current = dir;
    setDirection(dir);
  };

  // Get Casing Colors
  const getCasingClass = (): string => {
    switch (casing) {
      case 'atomic-purple':
        return 'bg-purple-950/80 border-purple-800 shadow-[0_0_25px_rgba(168,85,247,0.15)]';
      case 'classic-gray':
        return 'bg-[#c2c2c9] border-[#a1a1aa] shadow-2xl';
      case 'cyberpunk':
        return 'bg-neutral-950 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.25)]';
      case 'hot-pink':
        return 'bg-pink-600 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.25)]';
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#07070d] p-3 overflow-y-auto select-none">
      
      {/* Game Boy Console Body - Horizontal Layout (Enlarged) */}
      <div 
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`relative w-full max-w-[800px] h-[420px] rounded-[32px] border-4 flex flex-col p-4 transition-all duration-300 outline-none select-none ${getCasingClass()}`}
      >
        
        {/* --- CIRCUITS INTERIOR (Visible behind transparent casing) --- */}
        {casing === 'atomic-purple' && (
          <div className="absolute inset-0 opacity-20 pointer-events-none -z-10 overflow-hidden rounded-[28px]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="text-purple-400">
              {/* CPU Chip */}
              <rect x="50" y="240" width="85" height="85" rx="8" fill="currentColor" />
              <text x="58" y="285" className="font-mono text-[9px] font-bold text-black select-none">SHADOW_GBA_PRO</text>
              {/* Capacitor cylinders */}
              <circle cx="80" cy="60" r="14" fill="currentColor" />
              <circle cx="720" cy="280" r="15" fill="currentColor" />
              {/* Motherboard trace lines */}
              <path d="M 80 60 L 80 120 M 720 280 L 660 280 M 50 240 L 50 200" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        )}

        {/* Top Power Slider Button Switch */}
        <div className="absolute -top-[16px] left-16 flex items-center gap-1.5 z-20">
          <span className="text-[8px] font-mono text-white/45 tracking-widest font-bold">POWER</span>
          <button 
            onClick={togglePower}
            className={`w-12 h-4 bg-black/60 rounded-md border border-white/10 p-0.5 flex transition-all duration-200 clickable ${
              powerOn ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`w-5 h-full rounded bg-gray-300 border-b border-black/40 shadow shadow-black ${
              powerOn ? 'bg-[#00ff00]' : 'bg-red-600'
            }`} />
          </button>
        </div>

        {/* Casing top decals */}
        <div className="w-full flex justify-between px-4 select-none mb-2">
          <div className="flex gap-1.5 items-center font-mono text-[9px] font-bold tracking-widest text-white/45">
            <Gamepad2 className="w-4 h-4" />
            <span>PORTABLE RETRO CONSOLE ADVANCE PRO</span>
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* MAIN HORIZONTAL CONTROLLER SECTION */}
        <div className="flex-1 w-full flex justify-between items-center mt-1 gap-4">
          
          {/* LEFT COLUMN: D-PAD & SELECT */}
          <div className="w-[140px] flex flex-col items-center gap-8 select-none">
            {/* TACTILE D-PAD CROSS (Enlarged) */}
            <div className="relative w-24 h-24 flex items-center justify-center select-none">
              {/* Horizontal bar */}
              <div className="absolute w-24 h-8 bg-[#252528] rounded-md shadow-lg border-y border-white/5" />
              {/* Vertical bar */}
              <div className="absolute w-8 h-24 bg-[#252528] rounded-md shadow-lg border-x border-white/5" />
              {/* Central pivot circle */}
              <div className="absolute w-8 h-8 bg-[#18181b] rounded-full z-10 flex items-center justify-center">
                <div className="w-4 h-4 bg-[#101012] rounded-full border-t border-white/5" />
              </div>

              {/* D-Pad Buttons */}
              <button 
                onMouseDown={() => pressDirection('UP')}
                className="absolute top-0 left-8 w-8 h-8 rounded-t-md hover:bg-neutral-800/25 active:bg-neutral-900 z-10 flex items-center justify-center text-xs text-white/30 hover:text-white transition-colors clickable outline-none"
                aria-label="Up"
              >
                ▲
              </button>
              <button 
                onMouseDown={() => pressDirection('DOWN')}
                className="absolute bottom-0 left-8 w-8 h-8 rounded-b-md hover:bg-neutral-800/25 active:bg-neutral-900 z-10 flex items-center justify-center text-xs text-white/30 hover:text-white transition-colors clickable outline-none"
                aria-label="Down"
              >
                ▼
              </button>
              <button 
                onMouseDown={() => pressDirection('LEFT')}
                className="absolute left-0 top-8 w-8 h-8 rounded-l-md hover:bg-neutral-800/25 active:bg-neutral-900 z-10 flex items-center justify-center text-xs text-white/30 hover:text-white transition-colors clickable outline-none"
                aria-label="Left"
              >
                ◀
              </button>
              <button 
                onMouseDown={() => pressDirection('RIGHT')}
                className="absolute right-0 top-8 w-8 h-8 rounded-r-md hover:bg-neutral-800/25 active:bg-neutral-900 z-10 flex items-center justify-center text-xs text-white/30 hover:text-white transition-colors clickable outline-none"
                aria-label="Right"
              >
                ▶
              </button>
            </div>

            {/* Select Casing button */}
            <div className="flex flex-col items-center select-none">
              <button 
                onMouseDown={cycleCasing}
                className="w-12 h-3.5 bg-[#444] active:bg-neutral-800 rounded-full border border-black/45 rotate-[-15deg] shadow active:translate-y-[0.5px] clickable outline-none cursor-pointer"
                title="Change shell casing style"
              />
              <span className="text-[8px] font-mono font-bold text-white/45 tracking-wider mt-1 uppercase">CASING</span>
            </div>
          </div>

          {/* CENTER COLUMN: LCD SCREEN (Enlarged Bezel & Screen) */}
          <div className="w-[460px] h-[310px] bg-[#3a3b40] rounded-[14px] border-[4px] border-[#252528] flex flex-col p-2 select-none shadow-inner relative">
            
            {/* Top screen header border */}
            <div className="flex items-center justify-between w-full border-b border-white/10 pb-1 mb-1 px-1 shrink-0">
              <div className="w-10 h-0.5 bg-accent-cyan" />
              <span className="text-[8px] font-bold tracking-widest text-white/50 font-mono">DOT MATRIX CLASSIC LCD COLOR SCREEN</span>
              <div className="w-10 h-0.5 bg-accent-pink" />
            </div>

            {/* Battery LED Indicator */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 select-none z-10">
              <div className={`w-2 h-2 rounded-full border border-black/45 transition-all ${
                powerOn ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse' : 'bg-red-950'
              }`} />
              <span className="text-[6px] font-mono text-white/50 leading-none scale-[0.8] font-bold">PWR</span>
            </div>

            {/* LCD Screen Matrix Panel (Enlarged Area) */}
            <div className={`flex-1 border-2 border-black/55 rounded flex flex-col items-center justify-center relative transition-all overflow-hidden ${
              powerOn ? 'bg-[#9bbc0f] shadow-inner' : 'bg-[#18181b] border-[#101012]'
            }`}>
              
              {/* Scanline overlay for real LCD matrix feel */}
              {powerOn && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.06] -z-10"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1.5px, #000 1.5px, #000 3px)'
                  }}
                />
              )}

              {/* LCD Off Stage */}
              {!powerOn && (
                <div className="text-xs font-mono text-white/10 uppercase select-none tracking-widest font-bold">SYSTEM_STANDBY</div>
              )}

              {/* LCD Boot Scrolling Stage */}
              {powerOn && bootStage === 'scrolling' && (
                <div className="flex flex-col items-center animate-bounce">
                  <h1 
                    className="text-2xl font-black text-[#0f380f] tracking-widest font-mono select-none"
                    style={{ textShadow: '2px 2px 0px rgba(15,56,15,0.1)' }}
                  >
                    SHADOW
                  </h1>
                  <span className="text-[8px] font-mono font-bold text-[#0f380f]/60 tracking-widest uppercase">COLOR MATRIX SYSTEM</span>
                </div>
              )}

              {/* LCD Active Game Stage */}
              {powerOn && bootStage === 'ready' && (
                <div className="w-full h-full flex items-center justify-between gap-3 relative p-2 font-mono select-none text-[#0f380f]">
                  
                  {/* Left Side: 20x20 Snake Grid (Enlarged to 260px x 260px) */}
                  <div className="w-[260px] h-[260px] flex items-center justify-center shrink-0">
                    <div 
                      className="grid bg-[#9bbc0f] border-2 border-[#0f380f] p-0.5 relative"
                      style={{
                        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                        width: '246px',
                        height: '246px',
                      }}
                    >
                      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
                        const x = idx % GRID_SIZE;
                        const y = Math.floor(idx / GRID_SIZE);

                        const isHead = snake[0][0] === x && snake[0][1] === y;
                        const isBody = snake.slice(1).some(([sx, sy]) => sx === x && sy === y);
                        const isFood = food[0] === x && food[1] === y;

                        return (
                          <div
                            key={idx}
                            className={`w-full h-full border-[0.25px] border-[#0f380f]/5 flex items-center justify-center ${
                              isHead
                                ? 'bg-[#0f380f] rounded-[1.5px] border border-[#9bbc0f]'
                                : isBody
                                ? 'bg-[#0f380f]/85 rounded-[1px]'
                                : isFood
                                ? 'bg-[#0f380f]/90 rounded-full scale-[0.85] border border-[#9bbc0f] animate-pulse'
                                : ''
                            }`}
                          />
                        );
                      })}

                      {/* Pause or Game Over screen overlays */}
                      {(!isStarted || isGameOver) && (
                        <div className="absolute inset-0 bg-[#9bbc0f]/95 flex flex-col items-center justify-center gap-2 select-none text-center">
                          {isGameOver ? (
                            <>
                              <span className="text-sm font-black uppercase tracking-wider text-[#0f380f]">GAME OVER</span>
                              <span className="text-xs text-[#0f380f]/75 font-bold">SCORE: {score}</span>
                              <span className="text-[8px] text-[#0f380f]/50 mt-1 uppercase font-bold">PRESS A BUTTON / RESET TO PLAY</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-black tracking-widest text-[#0f380f] uppercase">PAUSED</span>
                              <span className="text-[9px] text-[#0f380f]/75 leading-tight font-bold">PRESS B TO RESUME</span>
                              <span className="text-[8px] text-[#0f380f]/50 scale-[0.9] mt-0.5 uppercase font-bold">OR D-PAD TO STEER</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Retro HUD Stats Panel */}
                  <div className="flex-1 h-full flex flex-col justify-between border-l-2 border-[#0f380f]/20 pl-3 font-mono text-[#0f380f] py-2">
                    <div className="flex flex-col gap-2.5">
                      <div className="text-[9px] font-black tracking-widest border-b border-[#0f380f]/20 pb-0.5">TELEMETRY</div>
                      
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold opacity-60">SCORE</span>
                        <span className="text-lg font-black leading-none">{score}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold opacity-60">HI-SCORE</span>
                        <span className="text-lg font-black leading-none">{highScore}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold opacity-60">SPEED LEVEL</span>
                        <span className="text-lg font-black leading-none">{Math.floor(score / 30) + 1}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 text-[8px] font-bold border-t border-[#0f380f]/20 pt-1.5 opacity-60 leading-tight">
                      <span>PAD : STEER</span>
                      <span>A   : RESET / START</span>
                      <span>B   : PAUSE / RESUME</span>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
          
          {/* RIGHT COLUMN: ACTION BUTTONS & RESET */}
          <div className="w-[140px] flex flex-col items-center gap-8 select-none">
            {/* TACTILE A/B ACTION BUTTONS (Enlarged & Rotated) */}
            <div className="relative w-24 h-12 bg-black/10 rounded-full border border-white/5 rotate-[-12deg] flex items-center justify-around px-2 py-0.5 select-none">
              {/* B Button */}
              <div className="flex flex-col items-center">
                <button
                  onMouseDown={() => {
                    if (!powerOn || bootStage !== 'ready') return;
                    handlePauseToggle();
                  }}
                  className="w-9 h-9 bg-[#8c1d3f] active:bg-[#68102a] border-2 border-[#310c17] rounded-full active:translate-y-[1px] shadow-md flex items-center justify-center font-bold text-sm text-white/55 hover:text-white active:shadow-inner clickable outline-none select-none cursor-pointer"
                >
                  B
                </button>
                <span className="text-[8px] font-mono font-bold text-white/45 mt-0.5 uppercase">PAUSE</span>
              </div>

              {/* A Button */}
              <div className="flex flex-col items-center">
                <button
                  onMouseDown={() => {
                    if (!powerOn || bootStage !== 'ready') return;
                    if (isGameOver) {
                      startGame();
                    } else if (!isStarted) {
                      startGame();
                    } else {
                      playSound('click');
                    }
                  }}
                  className="w-9 h-9 bg-[#8c1d3f] active:bg-[#68102a] border-2 border-[#310c17] rounded-full active:translate-y-[1px] shadow-md flex items-center justify-center font-bold text-sm text-white/55 hover:text-white active:shadow-inner clickable outline-none select-none cursor-pointer"
                >
                  A
                </button>
                <span className="text-[8px] font-mono font-bold text-white/45 mt-0.5 uppercase">START</span>
              </div>
            </div>

            {/* Start/Reset button */}
            <div className="flex flex-col items-center select-none">
              <button 
                onMouseDown={() => {
                  if (!powerOn || bootStage !== 'ready') return;
                  startGame();
                }}
                className="w-12 h-3.5 bg-[#444] active:bg-neutral-800 rounded-full border border-black/45 rotate-[-15deg] shadow active:translate-y-[0.5px] clickable outline-none cursor-pointer"
              />
              <span className="text-[8px] font-mono font-bold text-white/45 tracking-wider mt-1 uppercase">RESET</span>
            </div>
          </div>

        </div>

        {/* Console brand decals at the bottom */}
        <div className="w-full flex justify-between items-center px-6 select-none mt-2 shrink-0">
          <div className="flex flex-col font-mono text-left">
            <h2 className="text-[12px] font-extrabold tracking-widest text-slate-100 italic" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.4)' }}>
              Shadow<span className="text-accent-pink font-bold">GBA PRO</span>
            </h2>
            <span className="text-[6px] font-bold text-white/20 tracking-widest uppercase">16-BIT CLASSIC GRAPHICS COPROCESSOR</span>
          </div>

          {/* Speaker Grille lines */}
          <div className="flex gap-1 select-none pr-1">
            <div className="w-1.5 h-6 bg-black/30 rounded-full" />
            <div className="w-1.5 h-6 bg-black/30 rounded-full" />
            <div className="w-1.5 h-6 bg-black/30 rounded-full" />
            <div className="w-1.5 h-6 bg-black/30 rounded-full" />
            <div className="w-1.5 h-6 bg-black/30 rounded-full" />
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default GameApp;
