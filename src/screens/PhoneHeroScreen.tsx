import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { useSystemStore } from '../store/systemStore';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ParticleField } from '../3d/ParticleField';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

// Lazy-load the ThreeJS phone canvas to avoid blocking initial renders
const PhoneHero = lazy(() => import('../3d/PhoneHero'));

export const PhoneHeroScreen: React.FC = () => {
  const { setStage } = useSystemStore();
  const shouldReduceMotion = useReducedMotion();
  const [showScrollHint, setShowScrollHint] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll wheel detection to load the Desktop OS
  useEffect(() => {
    const handleWheelScroll = (e: WheelEvent) => {
      if (e.deltaY > 15) {
        setStage('desktop');
      }
    };

    window.addEventListener('wheel', handleWheelScroll);
    return () => {
      window.removeEventListener('wheel', handleWheelScroll);
    };
  }, [setStage]);

  // Inactivity tracking (3 seconds timer)
  const resetInactivityTimer = () => {
    setShowScrollHint(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      setShowScrollHint(true);
    }, 3000);
  };

  useEffect(() => {
    resetInactivityTimer();

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('wheel', resetInactivityTimer);

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('wheel', resetInactivityTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9980] bg-bg-base flex flex-col justify-between items-center p-6 select-none overflow-hidden">
      {/* Background drifting dots */}
      <ParticleField type="desktop" />

      {/* Top Header Mock Instructions */}
      <div className="w-full max-w-6xl flex justify-between items-center text-[10px] font-mono text-white/30">
        <span>DEVICE CONSOLE UPLINK</span>
        <span>DRAG MODEL TO ROTATE 3D</span>
      </div>

      {/* Main Center Space: 3D phone model loaded inside Suspense */}
      <div className="w-full flex-1 flex items-center justify-center relative pointer-events-none max-h-[80vh] md:max-h-[85vh]">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center font-mono text-[11px] text-white/40">
              <div className="w-8 h-8 rounded-full border border-t-accent-violet border-r-transparent animate-spin mb-3" />
              CONNECTING 3D TELEMETRY PIPELINE...
            </div>
          }
        >
          <PhoneHero />
        </Suspense>
      </div>

      {/* Bottom hint: Scroll down indicators */}
      <div className="h-10 flex items-center justify-center relative font-mono text-[10px] select-none text-white/40">
        <AnimatePresence>
          {showScrollHint && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              className="flex flex-col items-center gap-1.5 text-accent-green"
            >
              <span className="tracking-widest uppercase font-semibold drop-shadow-[0_0_8px_rgba(0,245,160,0.4)]">
                ↓ scroll down to enter system
              </span>
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <ArrowDown className="w-4 h-4 text-accent-green" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
