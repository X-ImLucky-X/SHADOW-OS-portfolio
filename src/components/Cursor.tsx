import React, { useEffect, useState, useRef } from 'react';

export const Cursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Direct translate3d update bypasses React state updates, offering zero-latency tracking
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('.clickable') ||
        target.closest('.dock-icon') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA';

      setIsHovered(!!isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    if (window.innerWidth >= 768) {
      window.addEventListener('mousemove', moveCursor);
      window.addEventListener('mouseover', handleMouseOver);
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseenter', handleMouseEnter);

      // Inject style to override default browser cursor
      const style = document.createElement('style');
      style.id = 'cursor-none-override';
      style.innerHTML = '* { cursor: none !important; }';
      document.head.appendChild(style);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      
      const styleNode = document.getElementById('cursor-none-override');
      if (styleNode) {
        styleNode.remove();
      }
    };
  }, [isVisible]);

  if (isMobile || !isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[10000]"
      style={{
        // Positioning offsets are manually calculated to center the dot based on size
        width: isHovered ? '24px' : '10px',
        height: isHovered ? '24px' : '10px',
        left: isHovered ? '-12px' : '-5px',
        top: isHovered ? '-12px' : '-5px',
        backgroundColor: isHovered ? 'var(--accent-pink)' : 'var(--accent-green)',
        boxShadow: isHovered
          ? '0 0 20px rgba(240, 0, 184, 0.8)'
          : '0 0 15px rgba(0, 245, 160, 0.8)',
        // Transition applies only to scale, color, and shadow. Transform coordinates remain un-transitioned for instant tracking.
        transition: 'width 0.15s ease-out, height 0.15s ease-out, left 0.15s ease-out, top 0.15s ease-out, background-color 0.15s ease-out, box-shadow 0.15s ease-out',
        willChange: 'transform',
      }}
    />
  );
};

export default Cursor;
