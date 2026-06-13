import React, { useEffect, useState } from 'react';
import { useSystemStore } from '../store/systemStore';

export const LockScreen: React.FC = () => {
  const { setStage } = useSystemStore();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [password, setPassword] = useState('');
  const [authLogs, setAuthLogs] = useState<string[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: DATE: OCT 26, 2023 | TIME: 09:41:00 AM
      const months = ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'];
      const monthStr = months[now.getMonth() % 12];
      const dayStr = String(now.getDate()).padStart(2, '0');
      const yearStr = now.getFullYear();
      const dateString = `${monthStr} ${dayStr}, ${yearStr}`;

      let hours = now.getHours();
      const ampm = hours >= 12 ? 'AM' : 'AM'; // Match style or use real AM/PM
      const actualAmPm = now.getHours() >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = String(hours).padStart(2, '0');
      const minutesStr = String(now.getMinutes()).padStart(2, '0');
      const secondsStr = String(now.getSeconds()).padStart(2, '0');
      
      setDate(dateString);
      setTime(`${hoursStr}:${minutesStr}:${secondsStr} ${actualAmPm}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isDecrypting) return;

    setIsDecrypting(true);
    setAuthLogs([]);

    // Step-by-step retro boot/decryption sequence
    const logs = [
      { text: 'DECRYPTING SYSTEM HASHES...', delay: 300 },
      { text: '[GRANTED] ACCESS GRANTED TO GUEST CLEARANCE', delay: 1000 },
    ];

    logs.forEach((log, idx) => {
      setTimeout(() => {
        setAuthLogs((prev) => [...prev, log.text]);
        if (idx === logs.length - 1) {
          setTimeout(() => {
            setStage('desktop');
          }, 600);
        }
      }, log.delay);
    });
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-[#050508] flex items-center justify-center p-4 font-mono select-none overflow-hidden">
      {/* Background CRT scanline overlay effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(16,16,24,0.4)_0%,rgba(0,0,0,0.8)_100%)]" />
      
      {/* Classic Windows 95 Style Decryption Dialog */}
      <div className="w-full max-w-[420px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center text-sm font-bold border border-t-white/20 border-l-white/20">
          <span className="font-pixel tracking-wide text-base">ACCESS SECURE TERMINAL v2.0</span>
          {/* Decorative Min/Max/Close buttons styled retro */}
          <div className="flex gap-[2px]">
            <div className="w-[16px] h-[14px] bg-[#c0c0c0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] flex items-center justify-center text-[8px] text-black font-bold">0</div>
            <div className="w-[16px] h-[14px] bg-[#c0c0c0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] flex items-center justify-center text-[8px] text-black font-bold">1</div>
            <div className="w-[16px] h-[14px] bg-[#c0c0c0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] flex items-center justify-center text-[8px] text-black font-bold">X</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col gap-4 bg-[#c0c0c0]">
          {/* Telemetry Clock Header */}
          <div className="text-center border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white bg-[#000000] text-[#00f5a0] py-2 px-1 font-pixel text-lg tracking-wider">
            DATE: {date} | TIME: {time}
          </div>

          {/* Simulated Cryptographic Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-pixel text-black font-bold tracking-wider">
                ENTER CLEARANCE ACCESS PASSWORD:
              </label>
              <div className="relative border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white bg-black">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black text-[#00f5a0] font-pixel text-lg outline-none px-2 py-1"
                  placeholder="********"
                  disabled={isDecrypting}
                  autoFocus
                />
              </div>
            </div>

            {/* Cryptographic button */}
            <button
              type="submit"
              disabled={isDecrypting}
              className="py-2 text-black font-pixel font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white active:bg-[#b0b0b0] outline-none text-base tracking-widest"
            >
              CRYPTOGRAPHIC LOGIN
            </button>
          </form>

          {/* Cryptographic status output logs */}
          <div className="h-20 bg-black border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-2 font-pixel text-sm flex flex-col gap-1 select-text overflow-y-auto leading-relaxed">
            {authLogs.length === 0 && (
              <span className="text-[#a0a0a0] animate-pulse">AWAITING SYSTEM SECURITY KEY...</span>
            )}
            {authLogs.map((log, index) => (
              <div
                key={index}
                className={log.startsWith('[GRANTED]') ? 'text-[#00f5a0] font-bold' : 'text-[#fbbf24]'}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
