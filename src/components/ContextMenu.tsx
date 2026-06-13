import React, { useEffect, useRef, useState } from 'react';
import { useWindowStore, AppId } from '../store/windowStore';
import { useSystemStore } from '../store/systemStore';

export const ContextMenu: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const { openWindow } = useWindowStore();
  const { setWallpaperStyle, toggleMatrix } = useSystemStore();

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Prevent context menu inside window apps, the taskbar, and dock launcher to keep normal browser copy/pasting functional there
      if (
        target.closest('.window-container') ||
        target.closest('.dock-container') ||
        target.closest('.taskbar-container') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        setVisible(false);
        return;
      }

      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (!visible) return null;

  // Keep menu inside screen boundaries
  const menuWidth = 180;
  const menuHeight = 240;
  const x = position.x + menuWidth > window.innerWidth ? position.x - menuWidth : position.x;
  const y = position.y + menuHeight > window.innerHeight ? position.y - menuHeight : position.y;

  const handleOpenApp = (id: AppId) => {
    openWindow(id);
    setVisible(false);
  };

  const handleSetWallpaper = (style: 'particles' | 'grid' | 'neon-waves') => {
    setWallpaperStyle(style);
    setVisible(false);
  };

  const handleMatrix = () => {
    toggleMatrix(true);
    setVisible(false);
  };

  const handleRunSystemInfo = () => {
    openWindow('terminal');
    setVisible(false);
    setTimeout(() => {
      const event = new CustomEvent('terminal-command', { detail: 'neofetch' });
      window.dispatchEvent(event);
    }, 150);
  };

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="fixed z-[9997] w-[180px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black py-1 shadow-md font-pixel text-[15px] text-black select-none"
    >
      <div className="px-2.5 py-0.5 text-[11px] text-[#808080] uppercase tracking-wider border-b border-[#dfdfdf] font-bold">
        Launch Program
      </div>
      
      <button
        onClick={() => handleOpenApp('terminal')}
        className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 transition-colors clickable font-pixel"
      >
        Terminal.exe
      </button>

      <button
        onClick={() => handleOpenApp('projects')}
        className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 transition-colors clickable font-pixel"
      >
        Projects.exe
      </button>

      <button
        onClick={() => handleOpenApp('ai')}
        className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 transition-colors clickable font-pixel"
      >
        AI_Assistant.bin
      </button>

      <div className="px-2.5 py-0.5 text-[11px] text-[#808080] uppercase tracking-wider border-b border-[#dfdfdf] border-t border-[#dfdfdf] mt-1 font-bold">
        Environment
      </div>

      <button
        onClick={() => handleSetWallpaper('neon-city')}
        className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 transition-colors clickable font-pixel"
      >
        Bg: Neon City
      </button>

      <button
        onClick={() => handleSetWallpaper('grid')}
        className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 transition-colors clickable font-pixel"
      >
        Bg: Grid Tech
      </button>

      <button
        onClick={() => handleMatrix()}
        className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 transition-colors clickable font-pixel"
      >
        Matrix Rain
      </button>

      <button
        onClick={handleRunSystemInfo}
        className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 transition-colors clickable border-t border-[#dfdfdf] mt-1 font-pixel"
      >
        System Telemetry
      </button>
    </div>
  );
};
