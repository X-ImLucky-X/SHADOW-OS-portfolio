import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Wifi } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isStreaming?: boolean;
}

export const AIApp: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `SHADOW_OS CORE INTELLIGENCE UPLINK LOADED.
      
      Hello, I am the ShadowOS Assistant, loaded with Lakshya Kumar Singh's professional credentials, experience, and telemetry.
      
      You can query me on:
      > EDUCATION / CGPA
      > EXPERIENCE (GDSC / FREELANCE)
      > PROJECTS (VOXMAIL, ADAS, SECURE STORAGE)
      > SOCIALS (LINKEDIN, GITHUB, LEETCODE)
      > CONTACT DETAILS`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Tell me about VoxMail AI',
    'What are your LeetCode stats?',
    'Show academic credentials',
    'Get contact details',
    'Explain ADAS project',
    'Show GDSC experience',
  ];

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [messages, isTyping, shouldReduceMotion]);

  // Match queries to detailed, structured answers
  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase().trim();
    
    // 1. Socials & Contact
    if (q.includes('linkedin')) {
      return `LAKSHYA'S LINKEDIN PROFILE:
      URL: https://www.linkedin.com/in/lakshya-kumar-singh-62142128b/
      
      Feel free to connect or send a direct message for inquiries or collaborations!`;
    }
    if (q.includes('github') || q.includes('git') || q.includes('repo')) {
      return `LAKSHYA'S GITHUB TELEMETRY:
      Username: X-ImLucky-X
      URL: https://github.com/X-ImLucky-X
      
      Highlights:
      - 10+ Public repositories
      - Active commit activity on local ML pipelines and agent orchestrators.
      - Core repository contributions in C++, Python, and TypeScript.`;
    }
    if (q.includes('leetcode') || q.includes('dsa') || q.includes('knight')) {
      return `LAKSHYA'S LEETCODE PROFILE STATS:
      Profile: https://leetcode.com/u/lakshyakumarsingh1/
      
      Metrics Dashboard:
      - System Badge: LEETCODE KNIGHT
      - Contest Rating: 1714.24 (Top 12.57% globally)
      - Contests Attended: 31
      - Total Solved: 357 Problems
        * Easy Solved: 172
        * Medium Solved: 167
        * Hard Solved: 18
      - Global Profile Rank: ~358,200`;
    }
    if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('number') || q.includes('mail') || q.includes('call')) {
      return `LAKSHYA'S SECURE CONTACT INFORMATION:
      - Email: lakshyakumarsingh1@gmail.com
      - Mobile: +91 89238 94012
      - Location: Chennai, Tamil Nadu, India
      
      Uplink open for professional inquiries, freelance machine learning work, and junior development positions.`;
    }

    // 2. Resume & Education
    if (q.includes('education') || q.includes('college') || q.includes('vit') || q.includes('university') || q.includes('gpa') || q.includes('school') || q.includes('cgpa')) {
      return `ACADEMIC HISTORY & CREDENTIALS:
      
      1. B.Tech in Computer Science and Engineering (AI & ML)
         Vellore Institute of Technology (VIT), Chennai (Expected 2027)
         * Current Cumulative GPA: 8.55 / 10.0
      
      2. Class XII (CBSE Board)
         St. Fidelis Sr. Sec. School, Aligarh (Graduated 2023)
         * Score: 86.2%
      
      3. Class X (CBSE Board)
         St. Fidelis Sr. Sec. School, Aligarh (Graduated 2021)
         * Score: 91.2%`;
    }

    // 3. Work Experience
    if (q.includes('experience') || q.includes('work') || q.includes('job') || q.includes('gdsc') || q.includes('freelance') || q.includes('member')) {
      return `ENGINEERING EXPERIENCE & PROFESSIONAL ROLES:
      
      1. Google Developer Student Club (GDSC), VIT Chennai
         Role: Tech Member (2024 – Present)
         * Organized and structured college-level technical events and workshops.
         * Worked with Google developer tools and emerging technologies.
      
      2. Freelance Machine Learning Developer
         Role: Independent Contractor (2023 – Present)
         * Programmed and deployed computer vision pipelines using YOLOv8 & MediaPipe.
         * Developed local RAG tools and document agents for office administration automations.
         * Refactored full-stack REST API schemas, optimizing database response speeds.`;
    }

    // 4. Specific Projects
    if (q.includes('voxmail')) {
      return `PROJECT REPORT: VoxMail AI Assistant
      Category: Agentic AI
      Stack: React Native, FastAPI, Supabase, PostgreSQL, Ollama (Qwen 2.5 7B), Gmail API
      
      Details:
      VoxMail is a privacy-first, offline-capable email agent. It runs local Ollama instances on-device to auto-summarize and draft responses for incoming client emails. Secure PostgreSQL schemas log email transactions while Gmail OAuth manages authentication tokens.`;
    }
    if (q.includes('autopilot') || q.includes('pilot')) {
      return `PROJECT REPORT: PilotOS Autopilot Engine
      Category: Agentic AI
      Stack: React, TailwindCSS, FastAPI, LangGraph, Ollama, Google Workspace APIs
      
      Details:
      An autonomous workspace executor. Uses LangGraph state machines to coordinate multi-agent tasks (Research, Calendar scheduling, and Email drafting) from single, unstructured user prompt commands.`;
    }
    if (q.includes('adas') || q.includes('lane') || q.includes('vehicle')) {
      return `PROJECT REPORT: Lane & Vehicle ADAS Simulation
      Category: Computer Vision
      Stack: Python, OpenCV, YOLOv8, PyTorch, NumPy
      
      Details:
      An advanced driver assistance system (ADAS) simulating real-time environment telemetry. Combines Canny edge filters and Hough transforms to map road lanes, and fuses YOLOv8 tracking nodes to calculate vehicle distance alerts.`;
    }
    if (q.includes('sign') || q.includes('gesture') || q.includes('language')) {
      return `PROJECT REPORT: Sign Language Recognition System
      Category: Computer Vision
      Stack: Python, OpenCV, MediaPipe, TensorFlow/Keras, pyttsx3
      
      Details:
      Translates gestures in real-time. MediaPipe coordinates 21 hand skeletal landmarks, filtering background noise out before feeding a custom convolutional neural network (CNN) to predict letter sequences, which are then read aloud using pyttsx3 speech.`;
    }
    if (q.includes('secure') || q.includes('storage') || q.includes('encrypt')) {
      return `PROJECT REPORT: Secure Cloud Storage Proxy
      Category: Full-Stack SaaS
      Stack: React, FastAPI, Express.js, PyCryptodome, Google Drive API
      
      Details:
      An end-to-end encrypted storage bridge. Encrypts files client-side using AES-GCM 256-bit cryptography prior to uploading to Google Drive. The original file metadata and names are packaged securely inside the encrypted binary payload.`;
    }
    if (q.includes('rag') || q.includes('knowledge') || q.includes('assistant')) {
      return `PROJECT REPORT: FAISS RAG Knowledge Base
      Category: Natural Language Processing
      Stack: FastAPI, LangChain, FAISS, HuggingFace Embeddings, Groq (Llama 3.1)
      
      Details:
      Processes multi-page PDF documents, indexes text chunks into a local FAISS vector store, and utilizes Groq cloud inference nodes to answer questions grounded strictly on document content.`;
    }
    if (q.includes('wealthflow') || q.includes('finance')) {
      return `PROJECT REPORT: WealthFlow SaaS Dashboard
      Category: Full-Stack SaaS
      Stack: React, Vite, TailwindCSS, Recharts, FastAPI, MongoDB Atlas
      
      Details:
      A financial ledger displaying monthly transaction telemetry, categories, and limits. Uses FastAPI endpoints, MongoDB Atlas schemas, and an Ollama financial advisory agent.`;
    }

    // 5. General project queries
    if (q.includes('project') || q.includes('portfolio') || q.includes('app')) {
      return `LAKSHYA'S CORE PORTFOLIO PROJECTS:
      
      - VOXMAIL AI: On-device offline email assistant utilizing local Qwen 2.5 7B.
      - AUTOPILOT OS: LangGraph multi-agent planning dashboard.
      - ADAS SIMULATION: Lane detection and YOLOv8 vehicle distance alerts.
      - SIGN LANGUAGE: Character and gesture translation with MediaPipe.
      - SECURE CLOUD STORAGE: Client-side AES-GCM encrypted Google Drive wrapper.
      - FAISS RAG: Offline document knowledge base.
      - WEALTHFLOW: Full-stack MERN financial dashboard.
      
      Type the name of any project (e.g., "VoxMail", "ADAS", "Secure Storage") to receive a detailed system report!`;
    }

    // 6. Certifications
    if (q.includes('cert') || q.includes('credential') || q.includes('license') || q.includes('course')) {
      return `TECHNICAL CERTIFICATIONS:
      - Advanced Learning Algorithms – DeepLearning.AI (2025)
      - Supervised Machine Learning – DeepLearning.AI / Stanford (2025)
      - Enterprise Blockchain Developer – IBM (2025)
      - Mastering DSA with C/C++ – Udemy (2025)
      - Packet Tracer Networking Essentials – Cisco (2025)`;
    }

    // 7. Core greeting or fallback
    return `SHADOW_OS CORE INTELLIGENCE UPLINK:
    Ask about any of the following telemetry sectors:
    
    1. **Resume**: Type "education", "experience", "GDSC", or "skills"
    2. **Projects**: Type "projects", "VoxMail", "ADAS", or "Secure Storage"
    3. **Metrics**: Type "LeetCode" or "GitHub"
    4. **Contact**: Type "contact", "email", "LinkedIn", or "phone"`;
  };

  // Simulated Streaming Text Responder (character-by-character)
  const handleAIResponseStream = (fullText: string) => {
    const messageId = Math.random().toString(36).substring(2, 9);
    
    // Create new streaming message placeholder
    setMessages((prev) => [
      ...prev,
      { id: messageId, sender: 'ai', text: '', isStreaming: true },
    ]);

    let currentCharIdx = 0;
    let currentText = '';

    const interval = setInterval(() => {
      if (currentCharIdx >= fullText.length) {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, text: fullText, isStreaming: false } : msg
          )
        );
        setIsTyping(false);
      } else {
        currentText += fullText[currentCharIdx];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, text: currentText } : msg
          )
        );
        currentCharIdx++;
      }
    }, 8); // Fast 8ms character streaming
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsgId = Math.random().toString(36).substring(2, 9);
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: textToSend }]);
    setInput('');
    setIsTyping(true);

    const reply = getAIResponse(textToSend);
    setTimeout(() => {
      handleAIResponseStream(reply);
    }, 400); // Small brain latency simulation
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#c0c0c0] font-pixel text-black select-none p-1">
      
      {/* Top Banner Win95 Toolbar */}
      <div className="bg-[#c0c0c0] flex items-center justify-between p-1.5 border-b border-white select-none">
        <div className="flex gap-2 items-center">
          <Terminal className="w-4 h-4 text-[#000080]" />
          <span className="text-xs font-bold text-[#000080] tracking-wide uppercase">AI CORE PILOT CLIENT v2.4</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700">
          <Wifi className="w-3.5 h-3.5 text-green-700 animate-pulse" />
          <span>CONNECTED</span>
        </div>
      </div>

      {/* Recessed Screen Area for retro green messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-black border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white font-mono flex flex-col gap-4 scrollbar-thin select-text">
        
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col w-full text-xs">
            {/* Message header */}
            <div className="flex items-center gap-1 select-none border-b border-[#00ff00]/10 pb-0.5 mb-1 text-[9px] font-bold tracking-wider">
              <span className={msg.sender === 'user' ? 'text-cyan-400' : 'text-green-500'}>
                {msg.sender === 'user' ? 'CLIENT_UPLINK' : 'SHADOW_AI'}
              </span>
              <span className="text-gray-600 font-sans">[127.0.0.1]</span>
            </div>

            {/* Message body */}
            <div className={`leading-relaxed whitespace-pre-line ${msg.sender === 'user' ? 'text-cyan-300' : 'text-green-400'}`}>
              {msg.text}
              {msg.isStreaming && (
                <span className="inline-block w-2.5 h-3.5 bg-green-500 ml-1 animate-pulse align-middle">█</span>
              )}
            </div>
          </div>
        ))}

        {isTyping && !messages[messages.length - 1]?.isStreaming && (
          <div className="flex flex-col text-xs text-green-400 select-none">
            <div className="flex items-center gap-1 select-none border-b border-[#00ff00]/10 pb-0.5 mb-1 text-[9px] font-bold tracking-wider">
              <span>SHADOW_AI</span>
              <span className="text-gray-600 font-sans">[127.0.0.1]</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] tracking-widest text-[#00ff00] animate-pulse">PROCESSING TELEMETRY...</span>
              <span className="inline-block w-2 h-3.5 bg-green-500 animate-ping">█</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts tray - Outset Bevel Buttons */}
      <div className="p-2 border-t border-white flex flex-wrap gap-2 select-none justify-center">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black text-black text-[11px] font-pixel px-2 py-1 font-bold active:border-t-black active:border-l-black active:border-b-white active:border-r-white active:bg-[#d0d0d0] disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-100 transition-all select-none"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Footer - Win95 Inset Style */}
      <div className="p-2 bg-[#c0c0c0] border-t border-white shrink-0 select-none">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2 items-stretch"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Type query (e.g. 'education', 'VoxMail', 'Leetcode')..."
            className="flex-1 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white text-black outline-none px-3 py-1.5 text-xs font-mono select-text"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black text-black text-xs px-4 py-1.5 font-bold font-pixel active:border-t-black active:border-l-black active:border-b-white active:border-r-white flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="w-3.5 h-3.5" />
            <span>SEND</span>
          </button>
        </form>
      </div>

      {/* Win95 Status Bar bottom */}
      <div className="bg-[#c0c0c0] border-t-2 border-gray-400 grid grid-cols-3 divide-x divide-gray-400 p-1 text-[9px] font-bold text-gray-700 select-none">
        <div className="px-2 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-600" />
          <span>SYS_STATUS: ONLINE</span>
        </div>
        <div className="px-2 text-center uppercase tracking-wide">
          MODE: INTEL_CORE_V2
        </div>
        <div className="px-2 text-right">
          PORT: 9005_PORTFOLIO
        </div>
      </div>

    </div>
  );
};

export default AIApp;
