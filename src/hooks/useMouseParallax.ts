import { useEffect, useState } from 'react';

export interface MousePosition {
  x: number; // Normalized from -0.5 to 0.5
  y: number; // Normalized from -0.5 to 0.5
}

export const useMouseParallax = (): MousePosition => {
  const [mouse, setMouse] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMouse({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return mouse;
};
