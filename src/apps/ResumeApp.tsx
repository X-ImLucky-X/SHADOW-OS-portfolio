import React from 'react';
import { resumeData } from '../data/resume';
import { projectsData } from '../data/projects';
import { useNotificationStore } from '../store/notificationStore';
import { FileDown, Mail, Github, Linkedin, ExternalLink, Printer } from 'lucide-react';

export const ResumeApp: React.FC = () => {
  const { addNotification } = useNotificationStore();

  const handleDownload = () => {
    addNotification('compiling resume packages...', 'info', 1000);
    
    setTimeout(() => {
      addNotification('generating document blob...', 'info', 1000);
      
      setTimeout(() => {
        // Generate readable text resume
        const docHeader = `==================================================\n`;
        const docTitle = `            LAKSHYA - RESUME TELEMETRY            \n`;
        const docSub = `      AI Engineer & Full-Stack Web Developer       \n`;
        const docContact = `Email: ${resumeData.email} | GitHub: ${resumeData.github}\n`;
        
        let experienceBlock = '\n[ PROFESSIONAL EXPERIENCE ]\n';
        resumeData.experience.forEach((e) => {
          experienceBlock += `\n* ${e.role} - ${e.company}\n  Period: ${e.period}\n`;
          e.points.forEach((p) => {
            experienceBlock += `  - ${p}\n`;
          });
        });

        let educationBlock = '\n[ ACADEMIC DEGREES ]\n';
        resumeData.education.forEach((edu) => {
          educationBlock += `\n* ${edu.degree}\n  Institution: ${edu.institution} (${edu.period})\n  Performance: ${edu.grade || 'N/A'}\n`;
        });

        let projectsBlock = '\n[ KEY BUILDS ]\n';
        projectsData.forEach((p) => {
          projectsBlock += `\n* ${p.title} (${p.tech.join(', ')})\n  Desc: ${p.shortDesc}\n  Code: ${p.github}\n`;
        });

        let certsBlock = '\n[ CERTIFICATIONS ]\n';
        resumeData.certifications.forEach((c) => {
          certsBlock += `\n* ${c}`;
        });
        certsBlock += '\n';

        const completeDoc = `${docHeader}${docTitle}${docSub}${docContact}${docHeader}\n${resumeData.summary}\n${experienceBlock}${educationBlock}${projectsBlock}${certsBlock}\n==================================================\nGenerated via ShadowOS v2.0 Client.`;

        const blob = new Blob([completeDoc], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Lakshya_Resume.txt';
        link.click();
        
        // Clean up url cache
        URL.revokeObjectURL(url);

        addNotification('Lakshya_Resume.txt downloaded successfully.', 'success');
      }, 1000);
    }, 800);
  };

  const handlePrint = () => {
    addNotification('Initializing terminal print queue...', 'info');
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-[#808080] flex justify-center items-start select-text scrollbar-thin">
      {/* Document Sheet Layout (White paper sheet) */}
      <div className="bg-white border-2 border-black p-6 w-full max-w-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-5 text-black font-sans text-xs select-text">
        
        {/* Top Download Bar Header Widget (Screen 10 Style) */}
        <div className="flex items-center gap-3 bg-[#c0c0c0] p-2 border-2 border-t-white border-l-white border-b-black border-r-black select-none">
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white font-pixel font-bold text-sm tracking-wider cursor-pointer outline-none shrink-0"
          >
            DOWNLOAD RESUME
          </button>
          
          {/* Text file block */}
          <div 
            onClick={handleDownload}
            className="flex-1 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white px-2 py-1 font-mono text-[11px] text-black cursor-pointer truncate select-none hover:underline"
          >
            Lakshya_Resume.txt
          </div>
        </div>

        {/* Header Block */}
        <div className="flex justify-between items-start flex-wrap gap-2 border-b border-black pb-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-wide text-[#000080] font-pixel">{resumeData.name}</h1>
            <p className="text-xs text-[#505050] font-bold mt-0.5">{resumeData.title}</p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex flex-col font-mono text-[10px] text-black/70 items-start">
              <div>Email: <a href={`mailto:${resumeData.email}`} className="underline text-blue-800 hover:text-blue-600 cursor-pointer">{resumeData.email}</a></div>
              <div>GitHub: <a href={resumeData.github} target="_blank" rel="noopener noreferrer" className="underline text-blue-800 hover:text-blue-600 cursor-pointer">{resumeData.github.replace('https://', '')}</a></div>
              <div>LinkedIn: <a href={resumeData.linkedin} target="_blank" rel="noopener noreferrer" className="underline text-blue-800 hover:text-blue-600 cursor-pointer">{resumeData.linkedin.replace('https://', '')}</a></div>
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-bold uppercase text-[#000080] border-b border-black pb-0.5 select-none">
            I // Summary
          </h2>
          <p className="text-xs leading-relaxed select-text font-bold">
            {resumeData.summary}
          </p>
        </div>

        {/* Work History */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase text-[#000080] border-b border-black pb-0.5 select-none">
            II // Work Experience
          </h2>
          <div className="flex flex-col gap-3">
            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="flex flex-col">
                <div className="flex justify-between font-bold">
                  <span>{exp.role}</span>
                  <span className="font-mono text-xs">{exp.period}</span>
                </div>
                <div className="flex justify-between text-xs text-[#505050] font-bold">
                  <span>{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                <ul className="list-disc pl-4 mt-1 text-[11px] text-[#404040] flex flex-col gap-0.5 leading-relaxed">
                  {exp.points.map((pt, idx) => (
                    <li key={idx} className="select-text">{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Academic History */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase text-[#000080] border-b border-black pb-0.5 select-none">
            III // Education
          </h2>
          <div className="flex flex-col gap-2">
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="flex flex-col">
                <div className="flex justify-between font-bold">
                  <span>{edu.degree}</span>
                  <span className="font-mono text-xs">{edu.period}</span>
                </div>
                <div className="flex justify-between text-xs text-[#505050] font-bold">
                  <span>{edu.institution}</span>
                  {edu.grade && <span className="text-green-800 font-mono">{edu.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Builds */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase text-[#000080] border-b border-black pb-0.5 select-none">
            IV // Technical Projects
          </h2>
          <div className="flex flex-col gap-2">
            {projectsData.slice(0, 4).map((proj) => (
              <div key={proj.id} className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center font-bold">
                  <span>{proj.title}</span>
                  <span className="text-[10px] font-mono text-[#000080] border border-[#000080] px-1">
                    {proj.tech.slice(0, 3).join(' / ')}
                  </span>
                </div>
                <p className="text-[11px] text-[#404040] select-text">
                  {proj.shortDesc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase text-[#000080] border-b border-black pb-0.5 select-none">
            V // Verified Certifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 font-bold">
            {resumeData.certifications.map((cert, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px] text-black">
                <span className="text-[#000080]">■</span>
                <span className="select-text">{cert}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
