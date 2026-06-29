import React from 'react';

// Common icon properties
interface RetroIconProps {
  className?: string;
}

// 1. Terminal.exe - Pixelated CRT screen with green prompt
export const RetroTerminalIcon: React.FC<RetroIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Screen Outer Bezel */}
    <rect x="2" y="4" width="28" height="22" fill="#808080" />
    <rect x="3" y="5" width="26" height="20" fill="#c0c0c0" />
    {/* Inner Screen */}
    <rect x="5" y="7" width="22" height="16" fill="#000000" />
    {/* Bottom stand */}
    <rect x="10" y="26" width="12" height="2" fill="#808080" />
    <rect x="8" y="28" width="16" height="2" fill="#404040" />
    {/* Green Prompt (>_) */}
    <path d="M 8 11 L 11 13 L 8 15" stroke="#00f5a0" strokeWidth="2" strokeLinecap="square" fill="none" />
    <rect x="13" y="14" width="4" height="2" fill="#00f5a0" />
  </svg>
);

// 2. Projects.exe - Classic Win95 yellow folder
export const RetroProjectsIcon: React.FC<RetroIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Back flap */}
    <path d="M 2 8 L 12 8 L 15 11 L 28 11 L 28 26 L 2 26 Z" fill="#808000" />
    {/* Document sheet sticking out */}
    <rect x="6" y="6" width="18" height="14" fill="#ffffff" stroke="#000000" strokeWidth="1" />
    <line x1="9" y1="10" x2="21" y2="10" stroke="#000080" strokeWidth="1" />
    <line x1="9" y1="13" x2="17" y2="13" stroke="#000080" strokeWidth="1" />
    {/* Front flap */}
    <path d="M 2 12 L 14 12 L 17 14 L 30 14 L 30 28 L 2 28 Z" fill="#ffff00" />
    {/* Folder border outline */}
    <path d="M 2 12 L 14 12 L 17 14 L 30 14 L 30 28 L 2 28 Z" stroke="#000000" strokeWidth="1.5" strokeLinejoin="miter" />
  </svg>
);

// 3. About.me - Pixelated ID badge card
export const RetroAboutIcon: React.FC<RetroIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* ID Card outline */}
    <rect x="3" y="5" width="26" height="22" fill="#ffffff" stroke="#000000" strokeWidth="2" />
    {/* Top colored strip */}
    <rect x="4" y="6" width="24" height="4" fill="#000080" />
    {/* Photo Box */}
    <rect x="6" y="13" width="8" height="10" fill="#c0c0c0" stroke="#000000" strokeWidth="1" />
    <circle cx="10" cy="16" r="2" fill="#404040" />
    <path d="M 7 22 C 7 19 13 19 13 22 Z" fill="#404040" />
    {/* Text lines */}
    <rect x="17" y="13" width="9" height="2" fill="#000000" />
    <rect x="17" y="17" width="7" height="2" fill="#000000" />
    <rect x="17" y="21" width="5" height="2" fill="#000000" />
  </svg>
);

// 4. Skills.sys - Retro 3.5" Floppy Disk
export const RetroSkillsIcon: React.FC<RetroIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Main Disk Body (dark blue/gray) */}
    <path d="M 3 3 L 25 3 L 29 7 L 29 29 L 3 29 Z" fill="#000080" stroke="#000000" strokeWidth="2" />
    {/* Metal Slider Cover at top */}
    <rect x="8" y="4" width="10" height="8" fill="#c0c0c0" stroke="#000000" strokeWidth="1" />
    <rect x="11" y="6" width="3" height="4" fill="#000000" />
    {/* Paper Label at bottom */}
    <rect x="6" y="15" width="20" height="13" fill="#ffffff" stroke="#000000" strokeWidth="1" />
    {/* Lines on label */}
    <line x1="9" y1="18" x2="23" y2="18" stroke="#808080" strokeWidth="1" />
    <line x1="9" y1="21" x2="23" y2="21" stroke="#808080" strokeWidth="1" />
    <line x1="9" y1="24" x2="19" y2="24" stroke="#808080" strokeWidth="1" />
  </svg>
);

// 5. AI_Assistant.bin - Retro desktop CRT robot face / wizard assistant
export const RetroAIIcon: React.FC<RetroIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Wizard Hat (Merlin style) or Retro Robot face */}
    <rect x="4" y="6" width="24" height="20" rx="4" fill="#008080" stroke="#000000" strokeWidth="2" />
    {/* Face screen */}
    <rect x="7" y="9" width="18" height="14" fill="#000000" />
    {/* Glowing green matrix grid eyes */}
    <rect x="10" y="12" width="3" height="3" fill="#00ff00" />
    <rect x="19" y="12" width="3" height="3" fill="#00ff00" />
    {/* Pixel smile */}
    <path d="M 10 18 L 13 20 L 19 20 L 22 18" stroke="#00ff00" strokeWidth="2" strokeLinecap="square" fill="none" />
    {/* Antennas */}
    <rect x="15" y="2" width="2" height="4" fill="#808080" />
    <circle cx="16" cy="2" r="2" fill="#ff00aa" />
  </svg>
);

// 6. Resume.pdf - Printable document with download arrow
export const RetroResumeIcon: React.FC<RetroIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Document sheet */}
    <path d="M 5 3 L 21 3 L 27 9 L 27 29 L 5 29 Z" fill="#ffffff" stroke="#000000" strokeWidth="2" />
    <path d="M 21 3 L 21 9 L 27 9" stroke="#000000" strokeWidth="2" fill="none" />
    {/* Text Lines */}
    <line x1="9" y1="10" x2="17" y2="10" stroke="#808080" strokeWidth="1.5" />
    <line x1="9" y1="14" x2="23" y2="14" stroke="#808080" strokeWidth="1.5" />
    <line x1="9" y1="18" x2="23" y2="18" stroke="#808080" strokeWidth="1.5" />
    {/* Bold Download Arrow in foreground */}
    <path d="M 18 20 L 24 20 L 21 24 Z" fill="#800080" stroke="#000000" strokeWidth="1" />
    <rect x="20" y="16" width="2" height="5" fill="#800080" stroke="#000000" strokeWidth="1" />
  </svg>
);

// 7. Contact.msg - Win95 yellow message envelope
export const RetroContactIcon: React.FC<RetroIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Envelope container */}
    <rect x="3" y="7" width="26" height="18" fill="#ffffd0" stroke="#000000" strokeWidth="2" />
    {/* Fold line vectors */}
    <path d="M 4 8 L 16 17 L 28 8" stroke="#808000" strokeWidth="1.5" fill="none" />
    <path d="M 4 24 L 12 16" stroke="#808000" strokeWidth="1.5" fill="none" />
    <path d="M 28 24 L 20 16" stroke="#808000" strokeWidth="1.5" fill="none" />
  </svg>
);

// 8. CyberSnake.exe - Game Boy style handheld unit icon
export const RetroGameIcon: React.FC<RetroIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Main body */}
    <rect x="6" y="3" width="20" height="26" rx="2" fill="#c0c0c0" stroke="#000000" strokeWidth="2" />
    {/* Screen */}
    <rect x="9" y="6" width="14" height="10" fill="#9bbc0f" stroke="#000000" strokeWidth="1.5" />
    <rect x="12" y="9" width="8" height="4" fill="#0f380f" />
    {/* D-Pad */}
    <path d="M 10 21 L 14 21 M 12 19 L 12 23" stroke="#000000" strokeWidth="1.5" strokeLinecap="square" />
    {/* A/B Buttons */}
    <circle cx="21" cy="22" r="1.5" fill="#8c1d3f" />
    <circle cx="18" cy="23" r="1.5" fill="#8c1d3f" />
  </svg>
);

// 9. WebNavigator.exe - Win95 Globe / Compass style browser icon
export const RetroBrowserIcon: React.FC<RetroIconProps> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="12" fill="#000080" stroke="#000000" strokeWidth="2" />
    <ellipse cx="16" cy="16" rx="6" ry="12" stroke="#00ffff" strokeWidth="1.5" />
    <line x1="4" y1="16" x2="28" y2="16" stroke="#00ffff" strokeWidth="1.5" />
    <path d="M 6 10 Q 16 14 26 10" stroke="#00ffff" strokeWidth="1" fill="none" />
    <path d="M 6 22 Q 16 18 26 22" stroke="#00ffff" strokeWidth="1" fill="none" />
  </svg>
);
