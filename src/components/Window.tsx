import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore, AppId } from '../store/windowStore';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface WindowProps {
  id: AppId;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ id, children }) => {
  const {
    windows,
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowStore();

  const shouldReduceMotion = useReducedMotion();
  const windowState = windows[id];
  const windowRef = useRef<HTMLDivElement>(null);

  // Close focused window on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeWindowId === id) {
        closeWindow(id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWindowId, id, closeWindow]);

  if (!windowState.isOpen) return null;

  const isActive = activeWindowId === id;

  // Manual Dragging Handler (Direct DOM updates for 60 FPS performance)
  const handleDragStart = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    focusWindow(id);

    // Prevent dragging when clicking on control circles or internal content
    const target = e.target as HTMLElement;
    if (target.closest('.window-controls') || !target.closest('.window-titlebar')) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = windowState.x;
    const initialY = windowState.y;
    let finalX = initialX;
    let finalY = initialY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Keep window within reasonable screen bounds so it doesn't get lost
      finalX = Math.max(10, Math.min(window.innerWidth - 150, initialX + deltaX));
      finalY = Math.max(30, Math.min(window.innerHeight - 100, initialY + deltaY));

      if (windowRef.current) {
        windowRef.current.style.left = `${finalX}px`;
        windowRef.current.style.top = `${finalY}px`;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Persist to store once on release
      updateWindowPosition(id, finalX, finalY);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Manual Resizing Handler (Direct DOM updates for 60 FPS performance)
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = windowState.width;
    const initialHeight = windowState.height;
    let finalWidth = initialWidth;
    let finalHeight = initialHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      finalWidth = Math.max(windowState.minWidth, initialWidth + deltaX);
      finalHeight = Math.max(windowState.minHeight, initialHeight + deltaY);

      if (windowRef.current) {
        windowRef.current.style.width = `${finalWidth}px`;
        windowRef.current.style.height = `${finalHeight}px`;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Persist to store once on release
      updateWindowSize(id, finalWidth, finalHeight);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Style properties based on maximize state
  const windowStyle: React.CSSProperties = windowState.isMaximized
    ? {
        position: 'fixed',
        top: '28px', // under retro taskbar
        left: '0',
        width: '100vw',
        height: 'calc(100vh - 96px)', // taskbar(28px) + dock(68px) space
        zIndex: windowState.zIndex,
      }
    : {
        position: 'fixed',
        top: `${windowState.y}px`,
        left: `${windowState.x}px`,
        width: `${windowState.width}px`,
        height: `${windowState.height}px`,
        zIndex: windowState.zIndex,
      };

  return (
    <AnimatePresence>
      {!windowState.isMinimized && (
        <motion.div
          ref={windowRef}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 50 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
          style={windowStyle}
          onClick={() => focusWindow(id)}
          className={`window-container flex flex-col select-text p-[3px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-lg ${
            isActive ? 'shadow-black/45' : 'shadow-black/25'
          }`}
        >
          {/* Window Titlebar */}
          <div
            onMouseDown={handleDragStart}
            className={`window-titlebar h-7 flex justify-between items-center px-2 select-none cursor-move shrink-0 ${
              isActive ? 'bg-[#000080] text-white font-bold' : 'bg-[#808080] text-gray-300'
            } font-pixel text-base`}
          >
            {/* Title text */}
            <div className="tracking-wide truncate uppercase">
              {windowState.title}
            </div>

            {/* Win95 styled controls on the right */}
            <div className="window-controls flex gap-[2px] items-center">
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  minimizeWindow(id);
                }}
                className="w-[18px] h-[18px] bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black flex items-center justify-center font-mono font-bold text-[9px] text-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white select-none clickable outline-none"
                aria-label="Minimize"
              >
                _
              </button>
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  maximizeWindow(id);
                }}
                className="w-[18px] h-[18px] bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black flex items-center justify-center font-mono font-bold text-[8px] text-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white select-none clickable outline-none"
                aria-label="Maximize"
              >
                ⬜
              </button>
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  closeWindow(id);
                }}
                className="w-[18px] h-[18px] bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black flex items-center justify-center font-mono font-bold text-[9px] text-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white select-none clickable outline-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Window Body Container */}
          <div className={`flex-1 overflow-auto relative border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white m-[2px] select-text ${
            id === 'terminal' || id === 'ai'
              ? 'bg-[#000000] text-[#00f5a0]'
              : id === 'resume'
              ? 'bg-[#808080] text-black'
              : id === 'browser'
              ? 'bg-[#c0c0c0] text-black'
              : 'bg-[#c0c0c0] text-black font-pixel'
          }`}>
            {children}
          </div>

          {/* Resize anchor handles (Bottom Right corner) */}
          {!windowState.isMaximized && (
            <div
              onMouseDown={handleResizeStart}
              className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end p-0.5 pointer-events-auto"
              style={{ zIndex: 100 }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" className="text-black/40 hover:text-accent-violet">
                <path d="M6 0 L8 0 L8 8 L0 8 L0 6 L4 6 L4 4 L6 4 Z" fill="currentColor" />
              </svg>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
