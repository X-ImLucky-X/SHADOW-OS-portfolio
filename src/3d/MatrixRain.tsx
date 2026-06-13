import React, { useEffect, useRef } from 'react';
import { useSystemStore } from '../store/systemStore';

export const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isMatrixActive, toggleMatrix } = useSystemStore();

  useEffect(() => {
    if (!isMatrixActive) return;

    // Auto terminate after 5 seconds
    const timer = setTimeout(() => {
      toggleMatrix(false);
    }, 5000);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Character set
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%&?!*+=<>[]{}';
    const chars = alphabet.split('');

    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);

    // Stagger start heights so characters don't fall in a flat row
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100;
    }

    let animationId: number;

    const draw = () => {
      // Fill canvas with semi-transparent dark base color to leave a trail
      ctx.fillStyle = 'rgba(9, 9, 15, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Choose color (random white highlights, cyber cyan, and primary neon green)
        const rand = Math.random();
        if (rand > 0.98) {
          ctx.fillStyle = '#ffffff'; // White lead character
        } else if (rand > 0.92) {
          ctx.fillStyle = '#00d4ff'; // Cyan accent
        } else {
          ctx.fillStyle = '#00f5a0'; // Classic primary neon green
        }

        ctx.fillText(char, x, y);

        // Reset drop column to top with a small randomized delay when it hits bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [isMatrixActive, toggleMatrix]);

  if (!isMatrixActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9990] bg-[#09090f]/50 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
