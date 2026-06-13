import React from 'react';

export const Scanline: React.FC = () => {
  return (
    <>
      {/* Repeating horizontal overlay line grid */}
      <div className="crt-overlay" />

      {/* Moving CRT vertical scanner bar */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <div className="w-full h-[3px] bg-accent-green/10 shadow-[0_0_15px_rgba(0,245,160,0.6)] absolute top-0 left-0 animate-scanline" />
      </div>
    </>
  );
};
