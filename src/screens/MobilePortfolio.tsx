import React, { useState } from 'react';
import { resumeData } from '../data/resume';
import { projectsData } from '../data/projects';
import { categorizedSkills } from '../data/skills';
import { Github, Linkedin, Mail, Send, Award, Cpu, BookOpen, Briefcase, GraduationCap, Menu, X, Code } from 'lucide-react';

export const MobilePortfolio: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus('error');
      return;
    }

    setStatus('sending');
    setTimeout(() => {
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  const navLinks = [
    { label: 'Home', target: '#home' },
    { label: 'About', target: '#about' },
    { label: 'Skills', target: '#skills' },
    { label: 'Projects', target: '#projects' },
    { label: 'Contact', target: '#contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.querySelector(target);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const getTechColorClass = (tech: string): string => {
    const t = tech.toLowerCase();
    if (t.includes('python')) return 'text-accent-cyan border-accent-cyan/35 bg-accent-cyan/5';
    if (t.includes('react') || t.includes('redux')) return 'text-accent-violet border-accent-violet/35 bg-accent-violet/5';
    if (t.includes('fastapi') || t.includes('node') || t.includes('express')) return 'text-accent-green border-accent-green/35 bg-accent-green/5';
    if (t.includes('pytorch') || t.includes('opencv') || t.includes('cnn')) return 'text-accent-pink border-accent-pink/35 bg-accent-pink/5';
    if (t.includes('c++')) return 'text-accent-amber border-accent-amber/35 bg-accent-amber/5';
    return 'text-white/60 border-white/10 bg-white/5';
  };

  return (
    <div className="w-full min-h-screen bg-bg-base text-white/90 font-sans flex flex-col justify-between overflow-x-hidden selection:bg-accent-green/20 selection:text-accent-green">
      
      {/* Sticky Top Header Nav */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#c0c0c0] border-b border-[#808080] z-[9995] px-4 flex justify-between items-center select-none shadow-sm">
        <div className="flex items-center gap-1.5 font-mono font-bold tracking-widest text-accent-green text-xs">
          <Cpu className="w-4 h-4 text-accent-green animate-pulse" />
          SHADOW // MOB
        </div>

        {/* Menu toggler */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 text-black hover:text-black/80 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Floating Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 top-14 bg-[#008080] z-[9990] flex flex-col items-center justify-center gap-6 font-mono select-none">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.target}
              onClick={(e) => handleLinkClick(e, link.target)}
              className="text-lg text-white/60 hover:text-accent-green tracking-widest uppercase transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Main content scroll container */}
      <main className="flex-1 w-full pt-14 px-4 flex flex-col gap-16 select-text max-w-lg mx-auto">
        
        {/* SECTION 1: HERO */}
        <section id="home" className="min-h-[80vh] flex flex-col justify-center items-start pt-10">
          <span className="text-[10px] font-mono text-accent-cyan tracking-widest uppercase mb-1">
            UPLINK_ESTABLISHED
          </span>
          
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            Hi, I'm <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-cyan drop-shadow-[0_0_12px_rgba(0,245,160,0.2)]">
              Lakshya
            </span>
          </h1>

          <p className="text-xs font-mono text-accent-violet font-semibold tracking-wider mt-2.5">
            AI Engineer & Full-Stack Developer
          </p>

          <p className="text-xs text-white/60 mt-4 leading-relaxed font-sans max-w-sm">
            {resumeData.summary}
          </p>

          {/* Social Links Row */}
          <div className="flex gap-4 mt-8 select-none">
            <a
              href={`mailto:${resumeData.email}`}
              className="p-2.5 bg-bg-surface border border-white/5 rounded-xl hover:border-accent-green/30 text-accent-green transition-all"
              aria-label="Email Address"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href={resumeData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-bg-surface border border-white/5 rounded-xl hover:border-accent-cyan/30 text-accent-cyan transition-all"
              aria-label="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={resumeData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-bg-surface border border-white/5 rounded-xl hover:border-accent-pink/30 text-accent-pink transition-all"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://leetcode.com/u/lakshyakumarsingh1/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-bg-surface border border-white/5 rounded-xl hover:border-accent-amber/30 text-accent-amber transition-all"
              aria-label="LeetCode Profile"
            >
              <Award className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* SECTION 2: ABOUT */}
        <section id="about" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-l-2 border-accent-green pl-3 font-mono">
            <h2 className="text-sm font-bold tracking-widest text-accent-green uppercase">
              ABOUT_ME
            </h2>
          </div>

          {/* Work experience timeline */}
          <div className="bg-bg-surface border border-white/5 p-4 rounded-xl">
            <h3 className="text-[10px] font-mono font-bold text-accent-cyan tracking-widest uppercase mb-4 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              EXPERIENCE_LOG
            </h3>
            
            <div className="flex flex-col gap-6 border-l border-white/10 pl-3.5 relative ml-1.5">
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="relative">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[20.5px] top-1 w-2 h-2 rounded-full bg-bg-surface border-2 border-accent-green shadow-[0_0_6px_rgba(0,245,160,0.5)]" />
                  
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-white leading-tight">{exp.role}</span>
                    <span className="text-[9px] font-mono text-accent-cyan">{exp.company}</span>
                    <span className="text-[8px] font-mono text-white/40 mt-0.5">{exp.period}</span>
                  </div>

                  <ul className="mt-2 list-disc pl-3.5 flex flex-col gap-1 text-[9px] text-white/60 font-sans leading-relaxed">
                    {exp.points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education timeline */}
          <div className="bg-bg-surface border border-white/5 p-4 rounded-xl">
            <h3 className="text-[10px] font-mono font-bold text-accent-violet tracking-widest uppercase mb-4 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              EDUCATION_LOG
            </h3>

            <div className="flex flex-col gap-5 border-l border-white/10 pl-3.5 relative ml-1.5">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="relative">
                  <div className="absolute -left-[20.5px] top-1 w-2 h-2 rounded-full bg-bg-surface border-2 border-accent-violet shadow-[0_0_6px_rgba(124,58,237,0.5)]" />
                  
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-white leading-tight">{edu.degree}</span>
                    <span className="text-[9px] font-mono text-accent-cyan">{edu.institution}</span>
                    <span className="text-[8px] font-mono text-white/40 mt-0.5">{edu.period}</span>
                    {edu.grade && <span className="text-[9px] text-accent-green/80 mt-1 font-mono">{edu.grade}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LeetCode telemetry log */}
          <div className="bg-bg-surface border border-white/5 p-4 rounded-xl">
            <h3 className="text-[10px] font-mono font-bold text-accent-amber tracking-widest uppercase mb-4 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              LEETCODE_TELEMETRY
            </h3>

            <div className="flex flex-col gap-3 font-mono text-[10px]">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-white/40">Tier Badge:</span>
                <span className="text-[#ffcc00] font-bold">KNIGHT (1714.24 Rating)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-white/40">Problems Solved:</span>
                <span className="text-white">357 Problems</span>
              </div>
              
              <div className="flex flex-col gap-1 my-1">
                {/* Easy */}
                <div className="flex justify-between text-[9px] text-white/55">
                  <span>Easy</span>
                  <span>172 Solved</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-green" style={{ width: '48%' }} />
                </div>
                
                {/* Medium */}
                <div className="flex justify-between text-[9px] text-white/55 mt-1">
                  <span>Medium</span>
                  <span>167 Solved</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-amber" style={{ width: '47%' }} />
                </div>

                {/* Hard */}
                <div className="flex justify-between text-[9px] text-white/55 mt-1">
                  <span>Hard</span>
                  <span>18 Solved</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-pink" style={{ width: '5%' }} />
                </div>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-1.5 mt-1">
                <span className="text-white/40">Global Profile Rank:</span>
                <span className="text-white">358,200</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/40">Contests Attended:</span>
                <span className="text-white">31</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SKILLS */}
        <section id="skills" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-l-2 border-accent-violet pl-3 font-mono">
            <h2 className="text-sm font-bold tracking-widest text-accent-violet uppercase">
              SKILLS_INDEX
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {categorizedSkills.map((group) => (
              <div key={group.category} className="bg-bg-surface border border-white/5 p-4 rounded-xl">
                <h3 className="text-[9px] font-mono text-white/40 tracking-widest uppercase mb-3 font-bold flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-accent-violet" />
                  {group.category}
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="text-[9px] font-mono bg-bg-elevated border border-white/5 px-2.5 py-1 rounded-md text-white/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: PROJECTS */}
        <section id="projects" className="flex flex-col gap-6 scroll-mt-20">
          <div className="border-l-2 border-accent-pink pl-3 font-mono">
            <h2 className="text-sm font-bold tracking-widest text-accent-pink uppercase">
              PROJECTS_LOG
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {projectsData.map((p) => (
              <div
                key={p.id}
                className="bg-bg-surface border border-accent-violet/25 p-4 rounded-xl flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-white leading-tight">{p.title}</h3>
                  <p className="text-[10px] text-white/60 leading-relaxed font-sans">{p.shortDesc}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[8px] font-mono border px-1.5 py-0.5 rounded ${getTechColorClass(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 font-mono text-[9px] border-t border-white/5 pt-3 select-none">
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/40 hover:text-white"
                  >
                    <Github className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-accent-cyan"
                  >
                    Live Demo
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: CONTACT */}
        <section id="contact" className="flex flex-col gap-6 scroll-mt-20 pb-16">
          <div className="border-l-2 border-accent-amber pl-3 font-mono">
            <h2 className="text-sm font-bold tracking-widest text-accent-amber uppercase">
              CONTACT_FORM
            </h2>
          </div>

          <div className="bg-bg-surface border border-white/5 p-4 rounded-xl">
            <form onSubmit={handleSend} className="flex flex-col gap-4 font-mono text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-white/45 tracking-widest uppercase">Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-bg-base border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent-violet transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-white/45 tracking-widest uppercase">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-bg-base border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent-violet transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-white/45 tracking-widest uppercase">Payload Message:</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-bg-base border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent-violet transition-all font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className={`mt-2 py-2 border rounded font-bold uppercase tracking-widest transition-all select-none flex items-center justify-center gap-1.5 ${
                  status === 'success'
                    ? 'border-accent-green text-accent-green bg-accent-green/5'
                    : status === 'sending'
                    ? 'border-accent-amber text-accent-amber animate-pulse'
                    : 'border-accent-violet text-accent-violet hover:border-accent-green hover:text-accent-green active:bg-accent-violet/5'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                {status === 'success' ? 'TRANSMITTED!' : status === 'sending' ? 'SENDING...' : 'SEND LOGS'}
              </button>

              {status === 'error' && (
                <span className="text-[9px] text-accent-pink text-center mt-1">
                  * ERR: Please enter all transmission fields.
                </span>
              )}
            </form>
          </div>
        </section>

      </main>

      {/* Mobile Footer */}
      <footer className="w-full py-4 bg-bg-surface border-t border-white/5 text-center font-mono text-[8px] text-white/20 select-none">
        SHADOW ARCHITECTURE MOB-V2.0 // © 2026 LAKSHYA
      </footer>

    </div>
  );
};
