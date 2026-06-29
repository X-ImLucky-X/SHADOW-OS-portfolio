import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWindowStore, AppId } from '../store/windowStore';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Retro Icons
import {
  RetroTerminalIcon,
  RetroProjectsIcon,
  RetroAboutIcon,
  RetroSkillsIcon,
  RetroAIIcon,
  RetroResumeIcon,
  RetroContactIcon,
  RetroGameIcon,
  RetroBrowserIcon
} from './RetroIcons';

interface DockItem {
  id: AppId;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}

export const Dock: React.FC = () => {
  const { windows, activeWindowId, openWindow, minimizeWindow, focusWindow } = useWindowStore();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dockItems: DockItem[] = [
    {
      id: 'terminal',
      label: 'Terminal',
      icon: <RetroTerminalIcon className="w-6 h-6" />,
      bgColor: 'rgba(0, 245, 160, 0.15)',
      borderColor: 'border-accent-green/30',
      glowColor: 'shadow-[0_0_15px_rgba(0,245,160,0.3)]',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <RetroProjectsIcon className="w-6 h-6" />,
      bgColor: 'rgba(124, 58, 237, 0.2)',
      borderColor: 'border-accent-violet/30',
      glowColor: 'shadow-[0_0_15px_rgba(124,58,237,0.3)]',
    },
    {
      id: 'about',
      label: 'About Me',
      icon: <RetroAboutIcon className="w-6 h-6" />,
      bgColor: 'rgba(240, 0, 184, 0.15)',
      borderColor: 'border-accent-pink/30',
      glowColor: 'shadow-[0_0_15px_rgba(240,0,184,0.3)]',
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: <RetroSkillsIcon className="w-6 h-6" />,
      bgColor: 'rgba(0, 212, 255, 0.15)',
      borderColor: 'border-accent-cyan/30',
      glowColor: 'shadow-[0_0_15px_rgba(0,212,255,0.3)]',
    },
    {
      id: 'ai',
      label: 'AI Assistant',
      icon: <RetroAIIcon className="w-6 h-6 animate-pulse" />,
      bgColor: 'rgba(0, 212, 255, 0.15)',
      borderColor: 'border-accent-cyan/30',
      glowColor: 'shadow-[0_0_15px_rgba(0,212,255,0.3)]',
    },
    {
      id: 'resume',
      label: 'Resume',
      icon: <RetroResumeIcon className="w-6 h-6" />,
      bgColor: 'rgba(240, 0, 184, 0.15)',
      borderColor: 'border-accent-pink/30',
      glowColor: 'shadow-[0_0_15px_rgba(240,0,184,0.3)]',
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: <RetroContactIcon className="w-6 h-6" />,
      bgColor: 'rgba(251, 191, 36, 0.15)',
      borderColor: 'border-accent-amber/30',
      glowColor: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
    },
    {
      id: 'game',
      label: 'CyberSnake',
      icon: <RetroGameIcon className="w-6 h-6" />,
      bgColor: 'rgba(240, 0, 184, 0.15)',
      borderColor: 'border-accent-pink/30',
      glowColor: 'shadow-[0_0_15px_rgba(240,0,184,0.3)]',
    },
    {
      id: 'browser',
      label: 'Web Browser',
      icon: <RetroBrowserIcon className="w-6 h-6" />,
      bgColor: 'rgba(0, 245, 160, 0.15)',
      borderColor: 'border-accent-green/30',
      glowColor: 'shadow-[0_0_15px_rgba(0,245,160,0.3)]',
    },
  ];

  const handleItemClick = (id: AppId) => {
    const win = windows[id];
    if (win.isOpen) {
      if (activeWindowId === id && !win.isMinimized) {
        // If open and focused, minimize it
        minimizeWindow(id);
      } else {
        // If open but not focused, focus it (restores if minimized)
        focusWindow(id);
      }
    } else {
      // If closed, open it
      openWindow(id);
    }
  };

  const getScale = (index: number) => {
    if (shouldReduceMotion) return 1;
    if (hoveredIndex === null) return 1;
    if (hoveredIndex === index) return 1.35; // Center hovered item
    if (Math.abs(hoveredIndex - index) === 1) return 1.15; // Directly adjacent
    return 1;
  };

  const getYTranslation = (index: number) => {
    if (shouldReduceMotion) return 0;
    if (hoveredIndex === null) return 0;
    if (hoveredIndex === index) return -12;
    if (Math.abs(hoveredIndex - index) === 1) return -5;
    return 0;
  };

  return (
    <div className="dock-container fixed bottom-2 left-1/2 -translate-x-1/2 z-[9990] pointer-events-auto font-pixel select-none">
      <div className="bg-[#c0c0c0] px-3 py-1.5 border-2 border-t-white border-l-white border-b-black border-r-black shadow-lg flex items-center gap-2">
        {dockItems.map((item, index) => {
          const win = windows[item.id];
          const isOpen = win.isOpen;
          const isActive = activeWindowId === item.id && !win.isMinimized;

          return (
            <div
              key={item.id}
              className="flex flex-col items-center relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Desktop Tooltip Label */}
              {hoveredIndex === index && (
                <div className="absolute -top-7 px-2 py-0.5 bg-[#000080] text-white border border-t-white border-l-white border-b-black border-r-black font-pixel text-[11px] uppercase tracking-wide pointer-events-none z-30">
                  {item.label}
                </div>
              )}

              {/* Launcher Icon Button (Win95 button style) */}
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-12 h-12 flex flex-col items-center justify-center border-2 outline-none cursor-pointer ${
                  isActive 
                    ? 'border-t-black border-l-black border-b-white border-r-white bg-[#dfdfdf] shadow-[inset_1px_1px_0px_#000000]' 
                    : 'border-t-white border-l-white border-b-black border-r-black bg-[#c0c0c0] active:border-t-black active:border-l-black active:border-b-white active:border-r-white'
                }`}
                aria-label={`Open ${item.label}`}
              >
                {/* Keep icons flat color styled */}
                <div className={`${isActive ? 'translate-x-[1px] translate-y-[1px]' : ''}`}>
                  {item.icon}
                </div>

                {/* Open Indicator Dot inside the button */}
                {isOpen && (
                  <div className={`w-2 h-2 absolute bottom-1 right-1 border border-black ${
                    isActive ? 'bg-[#00ff00]' : 'bg-[#808080]'
                  }`} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
