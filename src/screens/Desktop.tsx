import React, { useEffect } from 'react';
import { useWindowStore, AppId } from '../store/windowStore';
import { useSystemStore } from '../store/systemStore';
import { useNotificationStore } from '../store/notificationStore';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Components
import { Taskbar } from '../components/Taskbar';
import { Dock } from '../components/Dock';
import { Window } from '../components/Window';
import { ContextMenu } from '../components/ContextMenu';
import { Notification } from '../components/Notification';
import neonCityWallpaper from '../wallpaper/wp3102515-neon-city-wallpapers.jpg';

// Retro Pixel Art Icons
import {
  RetroTerminalIcon,
  RetroProjectsIcon,
  RetroAboutIcon,
  RetroSkillsIcon,
  RetroAIIcon,
  RetroResumeIcon,
  RetroContactIcon,
  RetroGameIcon
} from '../components/RetroIcons';

// Apps
import { TerminalApp } from '../apps/TerminalApp';
import { ProjectsApp } from '../apps/ProjectsApp';
import { AboutApp } from '../apps/AboutApp';
import { ResumeApp } from '../apps/ResumeApp';
import { SkillsApp } from '../apps/SkillsApp';
import { ContactApp } from '../apps/ContactApp';
import { AIApp } from '../apps/AIApp';
import { GameApp } from '../apps/GameApp';

interface Shortcut {
  id: AppId;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
}

export const Desktop: React.FC = () => {
  const { windows, openWindow, cycleWindows } = useWindowStore();
  const { wallpaperStyle } = useSystemStore();
  const { addNotification } = useNotificationStore();
  const shouldReduceMotion = useReducedMotion();

  // Welcome Notification on First Launch
  useEffect(() => {
    addNotification('Welcome to ShadowOS v2.0 — try launching the terminal.', 'success', 5000);
  }, []);

  // Keyboard shortcut listener for cycling windows (Tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent normal tab focus behavior to keep window focus clean
      if (e.key === 'Tab') {
        e.preventDefault();
        cycleWindows();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cycleWindows]);

  const shortcuts: Shortcut[] = [
    {
      id: 'terminal',
      label: 'Terminal.exe',
      icon: <RetroTerminalIcon className="w-8 h-8" />,
      colorClass: 'hover:bg-accent-green/10 border-accent-green/20 text-accent-green',
    },
    {
      id: 'projects',
      label: 'Projects.exe',
      icon: <RetroProjectsIcon className="w-8 h-8" />,
      colorClass: 'hover:bg-accent-violet/10 border-accent-violet/20 text-accent-violet',
    },
    {
      id: 'about',
      label: 'About.me',
      icon: <RetroAboutIcon className="w-8 h-8" />,
      colorClass: 'hover:bg-accent-pink/10 border-accent-pink/20 text-accent-pink',
    },
    {
      id: 'skills',
      label: 'Skills.sys',
      icon: <RetroSkillsIcon className="w-8 h-8" />,
      colorClass: 'hover:bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan',
    },
    {
      id: 'ai',
      label: 'AI_Assistant.bin',
      icon: <RetroAIIcon className="w-8 h-8" />,
      colorClass: 'hover:bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan',
    },
    {
      id: 'resume',
      label: 'Resume.pdf',
      icon: <RetroResumeIcon className="w-8 h-8" />,
      colorClass: 'hover:bg-accent-pink/10 border-accent-pink/20 text-accent-pink',
    },
    {
      id: 'contact',
      label: 'Contact.msg',
      icon: <RetroContactIcon className="w-8 h-8" />,
      colorClass: 'hover:bg-accent-amber/10 border-accent-amber/20 text-accent-amber',
    },
    {
      id: 'game',
      label: 'CyberSnake.exe',
      icon: <RetroGameIcon className="w-8 h-8" />,
      colorClass: 'hover:bg-accent-pink/10 border-accent-pink/20 text-accent-pink',
    },
  ];

  return (
    <div className="fixed inset-0 w-screen h-screen z-0 overflow-hidden select-none bg-[#008080] flex flex-col justify-between p-0 retro-theme">
      
      {/* --- Retro Synthwave Wallpaper (Lag-free, blur-free) --- */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#180828] via-[#2c0838] to-[#008080] overflow-hidden select-none">
        {/* Retro Sunset Sun (sharp solid edges, no blur shadow) */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-b from-[#ffff00] via-[#ff5500] to-[#ff00aa] overflow-hidden border-2 border-[#ff00aa]">
          {/* Horizontal lines */}
          <div className="absolute inset-0 flex flex-col justify-end gap-1 pb-1">
            <div className="h-[2px] w-full bg-[#180828]" />
            <div className="h-[4px] w-full bg-[#180828]" />
            <div className="h-[6px] w-full bg-[#200830]" />
            <div className="h-[8px] w-full bg-[#240834]" />
            <div className="h-[10px] w-full bg-[#280838]" />
            <div className="h-[12px] w-full bg-[#2a083a]" />
            <div className="h-[16px] w-full bg-[#2c083c]" />
          </div>
        </div>

        {/* Wireframe Mountains */}
        <svg className="absolute bottom-[35%] left-0 w-full h-32 text-[#ff00aa]/30 opacity-70 pointer-events-none" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path d="M 0 100 L 100 30 L 220 70 L 350 10 L 480 80 L 600 20 L 750 60 L 880 15 L 1000 100 Z" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 0 100 L 150 45 L 300 80 L 450 30 L 650 90 L 800 40 L 950 85 L 1000 100 Z" stroke="#00d4ff/30" strokeWidth="1.5" fill="none" />
        </svg>

        {/* 3D Perspective Grid Plane */}
        <div className="absolute bottom-0 left-0 w-full h-[40%] origin-bottom overflow-hidden" style={{ perspective: '300px' }}>
          <div 
            className="w-full h-[200%] absolute -bottom-[50%] left-0"
            style={{
              transform: 'rotateX(60deg)',
              backgroundImage: `
                linear-gradient(to right, rgba(0, 212, 255, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 212, 255, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              animation: 'grid-scroll 10s linear infinite'
            }}
          />
        </div>
        
        {/* CSS Animation for grid scrolling */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes grid-scroll {
            0% { background-position: 0 0; }
            100% { background-position: 0 320px; }
          }
        `}} />
      </div>

      {/* --- Desktop Interface UI Shell --- */}
      <Taskbar />

      {/* Main Shortcuts Area */}
      <main className="flex-1 w-full relative pt-14 pb-24 px-6">
        
        {/* Desktop Shortcuts Column Grid - Win95 Beveled Retro Icons */}
        <div className="flex flex-col flex-wrap gap-4 h-full max-h-[85%] max-w-[150px] items-start justify-start select-none">
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.id}
              onClick={() => openWindow(shortcut.id)}
              className="flex flex-col items-center justify-center w-[90px] py-1 select-none font-pixel text-base text-white hover:text-yellow-300 transition-colors"
            >
              {/* Outset grey button casing around icons */}
              <div className="p-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {shortcut.icon}
              </div>
              <span className="truncate mt-1.5 w-full text-center px-1 font-bold drop-shadow-[1px_1px_1px_rgba(0,0,0,1)]">
                {shortcut.label}
              </span>
            </button>
          ))}
        </div>

        {/* --- Window Render Manager Layer --- */}
        {windows.terminal.isOpen && (
          <Window id="terminal">
            <TerminalApp />
          </Window>
        )}

        {windows.projects.isOpen && (
          <Window id="projects">
            <ProjectsApp />
          </Window>
        )}

        {windows.about.isOpen && (
          <Window id="about">
            <AboutApp />
          </Window>
        )}

        {windows.resume.isOpen && (
          <Window id="resume">
            <ResumeApp />
          </Window>
        )}

        {windows.skills.isOpen && (
          <Window id="skills">
            <SkillsApp />
          </Window>
        )}

        {windows.ai.isOpen && (
          <Window id="ai">
            <AIApp />
          </Window>
        )}

        {windows.contact.isOpen && (
          <Window id="contact">
            <ContactApp />
          </Window>
        )}

        {windows.game.isOpen && (
          <Window id="game">
            <GameApp />
          </Window>
        )}
      </main>

      {/* Bottom Launch Bar */}
      <Dock />

      {/* Context Actions right-click menu & notification toasts */}
      <ContextMenu />
      <Notification />

    </div>
  );
};
