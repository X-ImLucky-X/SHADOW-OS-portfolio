import React, { useState } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { Mail, Github, Linkedin } from 'lucide-react';
import { resumeData } from '../data/resume';

export const ContactApp: React.FC = () => {
  const { addNotification } = useNotificationStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>(['Awaiting transmission request...']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      addNotification('Transmission fail: Missing required header logs.', 'error');
      setLogs((prev) => [...prev, '[ERROR] TRANSMISSION HEADER BLOCKED: Missing fields.']);
      return;
    }

    setIsSubmitting(true);
    setLogs(['[SYSTEM] Establishing message link socket...', '[SYSTEM] Cryptography handshakes started...']);
    addNotification('Establishing message link...', 'info', 1000);

    const logSteps = [
      { text: 'ENCRYPTING TEXT PACKETS VIA AES-GCM-256...', delay: 500 },
      { text: `PACKET ID: MSG_${Math.random().toString(16).substring(2, 8).toUpperCase()}`, delay: 1000 },
      { text: '[SUCCESS] PACKET TRANSMITTED TO GUEST CLEARANCE DATABASE.', delay: 1500 },
    ];

    logSteps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step.text]);
        if (idx === logSteps.length - 1) {
          setIsSubmitting(false);
          addNotification('LOGS TRANSMITTED: Message packets delivered.', 'success');
          // Reset form
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
        }
      }, step.delay);
    });
  };

  return (
    <div className="w-full h-full bg-[#c0c0c0] font-pixel text-black p-3 select-none overflow-y-auto leading-tight">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        
        {/* Left Column: Direct links / Transmit Channels */}
        <div className="md:col-span-2 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 flex flex-col justify-between h-[340px]">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold bg-[#000080] text-white px-2 py-0.5 border border-t-white border-l-white border-b-black border-r-black uppercase select-none tracking-wide">
              Transmit Channels
            </h3>
            <p className="text-[11px] text-[#404040] leading-normal font-sans">
              Connect directly via the official social channels or write a packet in the compiler console.
            </p>

            <div className="flex flex-col gap-1.5 mt-2">
              <a
                href={`mailto:${resumeData.email}`}
                className="flex items-center gap-2 px-2 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black hover:bg-[#dfdfdf] active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs font-bold transition-all text-black cursor-pointer"
              >
                <Mail className="w-4 h-4 text-green-800" />
                Email Console
              </a>
              <a
                href={resumeData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black hover:bg-[#dfdfdf] active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs font-bold transition-all text-black cursor-pointer"
              >
                <Github className="w-4 h-4 text-blue-900" />
                GitHub Tree
              </a>
              <a
                href={resumeData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black hover:bg-[#dfdfdf] active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs font-bold transition-all text-black cursor-pointer"
              >
                <Linkedin className="w-4 h-4 text-purple-900" />
                LinkedIn Node
              </a>
            </div>
          </div>
          <span className="text-[9px] text-[#808080] font-mono border-t border-[#808080] pt-2 select-none">
            SECURE LINK V2.0 // TLS 1.3
          </span>
        </div>

        {/* Right Column: Inset Form & Console Output */}
        <div className="md:col-span-3 flex flex-col gap-3 h-[340px]">
          {/* Form wrapper */}
          <div className="bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 flex flex-col gap-2 overflow-y-auto">
            <h3 className="text-xs font-bold bg-[#808080] text-white px-2 py-0.5 border border-t-white border-l-white border-b-black border-r-black uppercase select-none tracking-wide mb-1">
              Encrypted message form
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <label className="w-16 font-bold select-none text-right">Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white px-1.5 py-0.5 text-black outline-none font-bold"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-16 font-bold select-none text-right">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white px-1.5 py-0.5 text-black outline-none font-bold"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-16 font-bold select-none text-right">Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white px-1.5 py-0.5 text-black outline-none font-bold"
                />
              </div>

              <div className="flex items-start gap-2">
                <label className="w-16 font-bold select-none text-right mt-1">Message:</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white px-1.5 py-0.5 text-black outline-none font-sans font-bold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 py-1 bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white active:bg-[#dfdfdf] text-xs font-bold outline-none cursor-pointer select-none"
              >
                SUBMIT MESSAGE
              </button>
            </form>
          </div>

          {/* Bottom telemetry logs panel */}
          <div className="flex-1 bg-black border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-2 font-mono text-[11px] text-[#00f5a0] overflow-y-auto select-text leading-tight">
            {logs.map((log, index) => (
              <div
                key={index}
                className={log.includes('[ERROR]') ? 'text-red-500' : log.includes('[SUCCESS]') ? 'text-[#00ff00]' : 'text-yellow-500'}
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
