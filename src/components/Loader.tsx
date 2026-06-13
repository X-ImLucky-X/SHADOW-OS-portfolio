import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../store/systemStore';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const Loader: React.FC = () => {
  const { loadingProgress, setLoadingProgress, setStage } = useSystemStore();
  const [isDone, setIsDone] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let start = 0;
    const duration = 1600; // 1.6s load simulation
    const intervalTime = 16;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      start += step;
      if (start >= 100) {
        start = 100;
        clearInterval(timer);
        setLoadingProgress(100);
        
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => {
            setStage('boot');
          }, shouldReduceMotion ? 0 : 400);
        }, 200);
      } else {
        setLoadingProgress(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [setLoadingProgress, setStage, shouldReduceMotion]);

  // Compute blocks for progress bar matching photo: [|||||||||||||||        ]
  const totalBars = 20;
  const filledBars = Math.round((loadingProgress / 100) * totalBars);
  const barText = '[' + '|'.repeat(filledBars) + ' '.repeat(totalBars - filledBars) + ']';

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[10000] bg-[#050508] flex items-center justify-center p-6 font-pixel text-lg select-none text-white/85"
        >
          <div className="w-full max-w-md flex flex-col gap-4 pl-4 border-l-2 border-white/20 uppercase tracking-widest font-mono">
            
            {/* Header info */}
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold tracking-widest text-white">
                ShadowOS Boot Loader v2.0...
              </h1>
              <span className="text-xs text-white/40 tracking-wider">
                Loading Progress Coordinates...
              </span>
            </div>

            {/* Block Progress Bar */}
            <div className="text-xl text-accent-green font-bold flex items-center gap-3">
              <span>{barText}</span>
              <span className="min-w-[45px] text-right">{loadingProgress}%</span>
            </div>

            {/* Detail Logs mapping reference photo stats */}
            <div className="flex flex-col gap-1 text-[11px] text-white/30 leading-none pt-2 border-t border-white/5 font-mono select-none">
              <div className="flex justify-between">
                <span>Coordinates...</span>
                <span className="text-white/60">{(loadingProgress * 9.4).toFixed(1)} KB/s</span>
              </div>
              <div className="flex justify-between">
                <span>Terminating...</span>
                <span className="text-white/60">{(loadingProgress * 0.12).toFixed(1)} ADJ/s</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-white/5 text-white/20">
                <span>TEDread: 1355 35063</span>
                <span>T6TA: 53 965 KOB/s</span>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
