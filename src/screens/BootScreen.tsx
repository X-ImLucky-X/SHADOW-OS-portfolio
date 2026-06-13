import React, { useEffect, useState } from 'react';
import { useSystemStore } from '../store/systemStore';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface LogLine {
  text: string;
  delay: number;
  isRamCounter?: boolean;
}

export const BootScreen: React.FC = () => {
  const { setStage } = useSystemStore();
  const shouldReduceMotion = useReducedMotion();
  
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [ramCount, setRamCount] = useState(0);

  const bootLogs: LogLine[] = [
    { text: 'ShadowOS BIOS v2.0', delay: 150 },
    { text: 'CPU: Intel(R) Core(TM) i7-8565U @ 1.80GHz [OK]', delay: 200 },
    { text: 'WebGL: Enabled [OK]', delay: 150 },
    { text: 'RAM: 16GB [OK]', delay: 200 },
    { text: 'SCANNING PERIPHERALS...', delay: 200 },
    { text: 'MEM_COUNT', delay: 600, isRamCounter: true }, // Special trigger for RAM ticker
    { text: 'SCANNING PERIPHERALS... COMPLETED', delay: 150 },
    { text: 'SYSTEM INITIALIZING...', delay: 200 },
    { text: '[SUCCESS] BOOT COMPLETED SUCCESSFULLY.', delay: 150 },
    { text: 'CLICK OR PRESS ANY KEY TO INITIALIZE SECURE LOGIN.', delay: 100 },
  ];

  const handleSkip = () => {
    setStage('lock');
  };

  useEffect(() => {
    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);
    return () => {
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, []);

  useEffect(() => {
    if (currentLineIdx >= bootLogs.length) {
      // Auto transition to lock screen after a brief delay
      const autoTimer = setTimeout(() => {
        setStage('lock');
      }, 1500);
      return () => clearTimeout(autoTimer);
    }

    const currentItem = bootLogs[currentLineIdx];

    if (currentItem.isRamCounter) {
      let count = 0;
      const ramTimer = setInterval(() => {
        count += 512;
        if (count >= 16384) {
          clearInterval(ramTimer);
          setRamCount(16384);
          setCurrentLineIdx(prev => prev + 1);
        } else {
          setRamCount(count);
        }
      }, 15);
      return () => clearInterval(ramTimer);
    } else {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, currentItem.text]);
        setCurrentLineIdx(prev => prev + 1);
      }, shouldReduceMotion ? 0 : currentItem.delay);
      return () => clearTimeout(timer);
    }
  }, [currentLineIdx, shouldReduceMotion]);

  return (
    <div className="fixed inset-0 z-[9990] bg-[#050508] flex items-center justify-center p-6 font-pixel text-lg sm:text-xl select-none text-accent-green drop-shadow-[0_0_6px_rgba(0,245,160,0.25)]">
      
      {/* Screen logs area wrapper */}
      <div className="w-full max-w-2xl h-[380px] flex flex-col justify-between relative">
        
        {/* Log rows */}
        <div className="flex-1 flex flex-col gap-1.5 justify-start pl-4 border-l-2 border-accent-green/20">
          {displayedLines.map((line, idx) => (
            <div key={idx} className="leading-relaxed whitespace-pre-wrap">
              {line}
            </div>
          ))}

          {/* Animate memory check ticker */}
          {bootLogs[currentLineIdx]?.text === 'MEM_COUNT' && (
            <div className="leading-relaxed text-white">
              Checking Base Memory: {ramCount}KB OK...
            </div>
          )}

          {/* Cursor blinker */}
          <div className="flex items-center mt-1">
            <span className="w-2.5 h-4 bg-accent-green terminal-cursor-blink" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-accent-green/20 pt-3 flex justify-between items-center text-xs text-accent-green/50">
          <span>SECURE SHELL HARDWARE TEST</span>
          <span className="animate-pulse">CLICK OR PRESS ANY KEY TO BYPASS</span>
        </div>

      </div>
    </div>
  );
};

export default BootScreen;
