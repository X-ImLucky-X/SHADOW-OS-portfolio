import React, { useEffect, useState } from 'react';
import { useWindowStore, AppId } from '../store/windowStore';
import { useSystemStore } from '../store/systemStore';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Cpu, Wifi, Battery, Search, Layers } from 'lucide-react';

export const Taskbar: React.FC = () => {
  const { windows, activeWindowId, focusWindow, cycleWindows } = useWindowStore();
  const { toggleCommandPalette } = useSystemStore();
  const shouldReduceMotion = useReducedMotion();

  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Live Clock Update
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
      setDate(
        now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      // Throttle scroll triggers
      const now = Date.now();
      if (now - lastWheelTime < 100) return;
      lastWheelTime = now;

      if (e.deltaY > 15) {
        setIsVisible(false); // Scroll down -> hide
      } else if (e.deltaY < -15) {
        setIsVisible(true); // Scroll up -> show
      }
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Get active windows list
  const openWindows = Object.values(windows).filter((w) => w.isOpen);

  const getAppIconColor = (id: AppId) => {
    switch (id) {
      case 'terminal': return 'bg-accent-green';
      case 'projects': return 'bg-accent-violet';
      case 'about': return 'bg-accent-pink';
      case 'skills': return 'bg-accent-cyan';
      case 'ai': return 'bg-accent-cyan';
      case 'resume': return 'bg-accent-pink';
      case 'contact': return 'bg-accent-amber';
      default: return 'bg-white';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-8 z-[9991] font-pixel text-sm select-none bg-[#c0c0c0] border-b-2 border-b-[#404040] border-t-2 border-t-white px-2 py-1 flex justify-between items-center text-black shadow-md">
      {/* Left: Classic Menu Strip */}
      <div className="flex items-center gap-4">
        {/* Start / OS Brand Tag */}
        <span className="font-bold tracking-widest text-[#000080] pr-3 border-r border-[#808080] flex items-center gap-1">
          💾 SHADOW_OS
        </span>

        {/* Win95 Dropdown triggers */}
        <div className="flex gap-3 text-black">
          <button className="px-2 py-0.5 hover:bg-[#000080] hover:text-white transition-colors cursor-pointer outline-none">System</button>
          <button className="px-2 py-0.5 hover:bg-[#000080] hover:text-white transition-colors cursor-pointer outline-none">Applications</button>
          <button className="px-2 py-0.5 hover:bg-[#000080] hover:text-white transition-colors cursor-pointer outline-none">View</button>
          <button className="px-2 py-0.5 hover:bg-[#000080] hover:text-white transition-colors cursor-pointer outline-none">Help</button>
        </div>
      </div>

      {/* Center: Open App Tabs (Clean blocky look) */}
      <div className="hidden md:flex items-center gap-1 max-w-[40%] overflow-x-auto scrollbar-none px-2">
        {openWindows.map((win) => {
          const isActive = activeWindowId === win.id && !win.isMinimized;
          return (
            <button
              key={win.id}
              onClick={() => focusWindow(win.id)}
              className={`px-3 py-0.5 text-xs font-bold font-pixel border border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white truncate max-w-[100px] outline-none ${
                isActive ? 'bg-[#dfdfdf] shadow-[inset_1px_1px_0px_#000000]' : 'bg-[#c0c0c0]'
              }`}
            >
              {win.title.split('.')[0]}
            </button>
          );
        })}
      </div>

      {/* Right: Inset clock display box */}
      <div className="border border-t-[#404040] border-l-[#404040] border-b-white border-r-white px-2 bg-[#c0c0c0] font-pixel text-xs flex items-center gap-2 select-text font-bold">
        <span>📶</span>
        <span>{date}</span>
        <span className="text-black border-l border-[#808080] pl-2">{time}</span>
      </div>
    </header>
  );
};
