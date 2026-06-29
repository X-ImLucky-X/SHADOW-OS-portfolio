import React, { useState, useEffect, useRef } from 'react';
import { Project, projectsData } from '../data/projects';
import { useTelemetryStore } from '../store/telemetryStore';
import { useNotificationStore } from '../store/notificationStore';
import { useWindowStore } from '../store/windowStore';
import { 
  Github, 
  ExternalLink, 
  Code, 
  Search, 
  Play, 
  Square, 
  Cpu, 
  Terminal, 
  Layers, 
  ChevronRight, 
  Check, 
  Package,
  RefreshCw,
  X
} from 'lucide-react';

// Simulated log sequences for the 10 projects
const simulatedLogs: Record<string, string[]> = {
  'toxic-comments': [
    '$ shadowos pkg load @shadowos/toxic-comments',
    '[SYSTEM] Allocating 14.5 MB in NLP sandbox...',
    '[SYSTEM] Downloading GloVe vocabulary embeddings (400k word vectors)...',
    '[OK] Embeddings successfully cached in memory cache.',
    '[SYSTEM] Setting up TensorFlow/Keras pipeline configuration...',
    '[MODEL] Compiling GloVe+GRU neural layers structure...',
    '[SERVER] Binding Flask web server interface to 127.0.0.1:5000...',
    '[OK] API listener actively parsing requests.',
    '[TEST] Submitting sanity test comments...',
    '[TEST] comment_01: "This is brilliant work!" -> TOXICITY: 0.01 (Clean)',
    '[TEST] comment_02: "Get lost, I hate your face" -> TOXICITY: 0.94 (Insult)',
    '[STATUS] Classification service running.'
  ],
  'voxmail': [
    '$ shadowos pkg load @shadowos/voxmail-ai',
    '[SYSTEM] Spawning offline Agentic container (8.2 MB)...',
    '[OLLAMA] Checking local server handshake on http://localhost:11434...',
    '[OLLAMA] local Ollama node detected. Loading Qwen 2.5 7B model...',
    '[AGENT] Initializing Triage Agent (email classification module)...',
    '[AGENT] Initializing Draft Agent (response synthesizer module)...',
    '[OAUTH] Establishing secure credential tokens with Google Gmail API...',
    '[SUPABASE] Handshake with Supabase database schema... OK',
    '[SYSTEM] Fetching unread active user inbox count...',
    '[AGENT] Triage: Identified 3 promotional, 2 urgent, 5 newsletter threads.',
    '[AGENT] Draft Gen: Synthesized response for ID: "Urgent Client Update".',
    '[STATUS] Agent daemon running.'
  ],
  'secure-storage': [
    '$ shadowos pkg load @shadowos/secure-storage',
    '[SYSTEM] Initializing cryptoproxy gateway (5.1 MB)...',
    '[CRYPTO] Verifying client-side WebCrypto AES-GCM parameters...',
    '[CRYPTO] Client key derivation function (PBKDF2) set up. Key active.',
    '[SYSTEM] Connecting to backend Express.js server router...',
    '[FASTAPI] Python cryptographic layer handshake confirmed.',
    '[API] Authorizing OAuth tokens for target Google Drive folder...',
    '[OK] Proxy tunnel established at http://localhost:8080.',
    '[TEST] Uploading payload block encrypted as AES-GCM-256 byte stream...',
    '[SUCCESS] Block uploaded to Google Drive API. ID: drive://938fa8b2...',
    '[STATUS] Crypto storage proxy running.'
  ],
  'pilot-os': [
    '$ shadowos pkg load @shadowos/pilot-os',
    '[SYSTEM] Starting LangGraph multi-agent controller (11.4 MB)...',
    '[SYSTEM] Loading orchestrator node configurations...',
    '[GRAPH] Mapping execution graph: [Start] -> [Triage] -> [Research] -> [Calendar] -> [Draft] -> [End]',
    '[AGENT] Initializing Calendar sub-agent & Gmail agent clusters...',
    '[OLLAMA] Querying local Ollama nodes for orchestration instruction...',
    '[TEST] Simulating prompt: "Research weather in Chennai and email team"...',
    '[STEP] Node: Research -> Querying Open-Meteo API for Chennai weather... OK',
    '[STEP] Node: Draft -> Compiling response email with weather telemetry...',
    '[STEP] Node: Gmail -> Delivering mail via secure API credentials...',
    '[STATUS] LangGraph workflow manager idle.'
  ],
  'sign-language': [
    '$ shadowos pkg load @shadowos/sign-language',
    '[SYSTEM] Mount OpenCV capture interfaces (22.1 MB)...',
    '[OPENCV] Opening system camera device ID: 0 (640x480 resolution)...',
    '[MEDIAPIPE] Loading skeletal hand landmarks models (21 coordinate trackers)...',
    '[SYSTEM] Background noise cancellation filter active.',
    '[MODEL] Initializing TensorFlow CNN gesture classifier model...',
    '[TEST] Reading camera frames in loop (30 FPS loop target)...',
    '[TEST] Skeletal points extracted: Gesture matches class [H-E-L-L-O].',
    '[TTS] Synthesizing speech track: "Hello" (pyttsx3 renderer)...',
    '[STATUS] Sign Language Vision Engine running.'
  ],
  'wealthflow': [
    '$ shadowos pkg load @shadowos/wealthflow',
    '[SYSTEM] Launching WealthFlow SaaS web components (7.8 MB)...',
    '[DATABASE] Establishing connection to MongoDB Atlas cluster replica set...',
    '[DATABASE] Connection successful. Seeding initial collections schema...',
    '[SERVER] Starting FastAPI backend listener on http://localhost:8000...',
    '[API] Active endpoints: /api/transactions, /api/budgets, /api/advisor',
    '[AGENT] Loading LangGraph Ollama advisory agent for finance data...',
    '[TEST] Advisory check: "Exceeded dining budget by 35% on June 12"...',
    '[AGENT] Advisor: "Recommended action: Shift $100 from leisure to dining."',
    '[STATUS] WealthFlow SaaS server active.'
  ],
  'shophub': [
    '$ shadowos pkg load @shadowos/shophub',
    '[SYSTEM] Initializing MERN ShopHub store dashboard (9.4 MB)...',
    '[DATABASE] Handshaking MongoDB Atlas database connections... OK',
    '[Mongoose] Schemas loaded for products, cart, order-transactions.',
    '[GATEWAY] Authorizing Razorpay payment credentials API...',
    '[SERVER] Express.js server router online at port 5000.',
    '[CLIENT] Vite web server hosting client pages at http://localhost:3000.',
    '[TEST] Adding product ID: "64f923b..." to shopping basket...',
    '[TEST] Simulating Razorpay checkout webhook event...',
    '[SUCCESS] Payment verification accepted. Order ID: pay_98F392A...',
    '[STATUS] ShopHub MERN services running.'
  ],
  'adas-lane': [
    '$ shadowos pkg load @shadowos/adas-lane',
    '[SYSTEM] Initializing Lane & Vehicle ADAS analyzer (48.2 MB)...',
    '[OPENCV] Opening video feed resource: highway_capture.mp4...',
    '[VISION] Applying Gaussian blur, Canny threshold, and ROI crop mask...',
    '[VISION] Calculating Hough lines transform coefficients...',
    '[VISION] Smooth lane projection active (EMA filter alpha=0.15)...',
    '[TORCH] Initializing PyTorch runtime on CUDA device...',
    '[YOLO] Loading YOLOv8 object detection weights...',
    '[TEST] Processing frame index 120: 3 vehicles tracked in front path.',
    '[WARN] COLLISION ALARM: Proximity to Vehicle #1 is < 10 meters! Alert!',
    '[STATUS] ADAS tracker frame processing running.'
  ],
  'rag-assistant': [
    '$ shadowos pkg load @shadowos/rag-assistant',
    '[SYSTEM] Allocating RAG Knowledge Base memory space (6.4 MB)...',
    '[PARSER] Reading local PDF text pages (PyMuPDF parser interface)...',
    '[TRANSFORMER] Generating document text embeddings (sentence-transformers)...',
    '[FAISS] Building vector index database directory...',
    '[DATABASE] 85 document splits successfully indexed in local FAISS.',
    '[API] Connecting to Groq Cloud endpoint. Llama-3.1-70b-versatile model...',
    '[TEST] Ask: "Explain Lakshya\'s B.Tech major?"',
    '[TEST] Groq Response: "Lakshya is studying Computer Science with AI/ML..."',
    '[STATUS] RAG knowledge assistant waiting.'
  ],
  'data-forge': [
    '$ shadowos pkg load @shadowos/data-forge',
    '[SYSTEM] Spawning AutoDataForge pipeline (3.9 MB)...',
    '[PARSER] Monitoring data/source/ directory for raw text and PDFs...',
    '[CLEANING] Regex parser loaded. Masking phone numbers and credentials...',
    '[API] Connecting to OpenAI completions endpoint...',
    '[LLM] Distilling unstructured text lines into fine-tuning Q&A formats...',
    '[TEST] Structuring segment: "VIT Chennai was established in 2010"...',
    '[TEST] Q&A Pair generated: Q: When was VIT Chennai established? A: 2010.',
    '[SUCCESS] Appended 50 new Q&A pairs to train_dataset.jsonl.',
    '[STATUS] Pipeline execution completed. Task idle.'
  ],
  'leetcode-revision': [
    '$ shadowos pkg load @shadowos/leetcode-revision',
    '[SYSTEM] Booting document compiler engine (2.4 MB)...',
    '[NODE] Loading docx.js and file writer systems...',
    '[SYSTEM] Loading C++ solutions repository directory...',
    '[DATA] Parsing 150 problems metadata from NeetCode collection...',
    '[PROCESS] Compiling Arrays & Two Pointers sheets...',
    '[SUCCESS] Document generated: dist/NeetCode_Arrays.docx.',
    '[SUCCESS] Document generated: dist/NeetCode_TwoPointers.docx.',
    '[STATUS] Revision engine completed tasks.'
  ],
  'd2t-research': [
    '$ shadowos pkg load @shadowos/d2t-research',
    '[SYSTEM] Launching research workspace container (1.2 MB)...',
    '[NLP] Loading Core NLP fact extraction models...',
    '[KG] Generating knowledge graph semantic triples (Subject-Predicate-Object)...',
    '[TEST] Submitting long-context text generation...',
    '[PROCESS] Running factual discrepancy comparison pass...',
    '[WARN] Hallucination detected in positional token range 240-280.',
    '[FIX] Running iterative feedback correction loop...',
    '[SUCCESS] Consistency score improved from 0.72 to 0.96.',
    '[STATUS] Research suite idling.'
  ],
  'inamigos-platform': [
    '$ shadowos pkg load @shadowos/inamigos-platform',
    '[SYSTEM] Instantiating NGO web platform (5.6 MB)...',
    '[SERVER] Starting Node.js / Express backend server at port 3000...',
    '[CLIENT] Loading static volunteer form templates...',
    '[GATEWAY] Connecting secure donation processing tunnel...',
    '[TEST] Submitting volunteer signup form request...',
    '[SUCCESS] Registration parsed. Storing database document...',
    '[STATUS] NGO platform online and listening.'
  ]
};

const projectArchitectures: Record<string, { label: string; desc: string }[]> = {
  'toxic-comments': [
    { label: 'Input Stream', desc: 'Raw comment text strings' },
    { label: 'Preprocessing', desc: 'Profanity scrub & emoji normalization' },
    { label: 'Tokenization', desc: 'Sequence padding with GloVe vectors' },
    { label: 'Deep GRU model', desc: 'TensorFlow recurrent neural layers' },
    { label: 'Flask Server', desc: 'REST API output (6 toxic labels)' }
  ],
  'voxmail': [
    { label: 'Email Webhooks', desc: 'Gmail IMAP watch webhook listener' },
    { label: 'Local Ollama Node', desc: 'Qwen 2.5 7B offline LLM inference' },
    { label: 'Triage Agent', desc: 'Classify content priority level' },
    { label: 'Draft Agent', desc: 'Synthesizing response draft' },
    { label: 'Supabase DB', desc: 'Store session logs & status metadata' }
  ],
  'secure-storage': [
    { label: 'React Web UI', desc: 'Client folder browser interface' },
    { label: 'Crypto Proxy', desc: 'Client AES-GCM 256-bit cryptography' },
    { label: 'Express Proxy', desc: 'Middleware forwarding encrypted buffers' },
    { label: 'FastAPI Backend', desc: 'Python authorization controller' },
    { label: 'Cloud Bucket', desc: 'Google Drive API storage nodes' }
  ],
  'pilot-os': [
    { label: 'Prompt Input', desc: 'User natural language query' },
    { label: 'LangGraph Core', desc: 'Stateful DAG node traversal manager' },
    { label: 'Sub-Agents', desc: 'Dedicated research, calendar, & gmail sub-agents' },
    { label: 'APIs Integration', desc: 'Google Workspace OAuth endpoints' }
  ],
  'sign-language': [
    { label: 'Video Source', desc: 'OpenCV capture webcam image stream' },
    { label: 'Skeletal Extract', desc: 'MediaPipe 21 hand skeletal landmarks' },
    { label: 'Normalization', desc: 'Center coordinates, filter noise' },
    { label: 'CNN Inference', desc: 'TensorFlow model class classifier' },
    { label: 'pyttsx3 Audio', desc: 'Local offline text-to-speech speaker' }
  ],
  'wealthflow': [
    { label: 'Vite Dashboard', desc: 'Recharts financial data representation' },
    { label: 'FastAPI Endpoints', desc: 'Asynchronous transactional controller' },
    { label: 'MongoDB Atlas', desc: 'Budgets & transactions store Collections' },
    { label: 'LangGraph Advisor', desc: 'Ollama-powered financial agent' }
  ],
  'shophub': [
    { label: 'React Frontend', desc: 'Tailwind product grid and cart panels' },
    { label: 'Node/Express API', desc: 'User accounts, cart persistence server' },
    { label: 'Razorpay Gateway', desc: 'Merchant payment token processor' },
    { label: 'MongoDB Atlas', desc: 'Mongoose models storing purchase receipts' }
  ],
  'adas-lane': [
    { label: 'Video Input', desc: 'Dashboard camera highway capture files' },
    { label: 'CV Filters', desc: 'Gaussian blur, Canny thresholds, ROI masks' },
    { label: 'Lanes Hough Lines', desc: 'Exponential moving average curve plotting' },
    { label: 'YOLOv8 Proximity', desc: 'PyTorch deep object trackers' },
    { label: 'Alarm Handler', desc: 'Audio warnings on collision proximity' }
  ],
  'rag-assistant': [
    { label: 'PDF Parser', desc: 'PyMuPDF text extraction pipeline' },
    { label: 'Embedding Model', desc: 'HuggingFace transformer tokenization' },
    { label: 'Vector Database', desc: 'FAISS indexed vector catalogs' },
    { label: 'Groq Cloud API', desc: 'Llama 3.1 70B grounded context inference' }
  ],
  'data-forge': [
    { label: 'Data Import', desc: 'Raw unstructured text files directory' },
    { label: 'PII Scrubbing', desc: 'Regex expression filters for privacy data' },
    { label: 'OpenAI GPT-3.5', desc: 'Fine-tuning target QA distillers' },
    { label: 'JSONL Storage', desc: 'Saving structured rows in local dataset' }
  ],
  'leetcode-revision': [
    { label: 'C++ Solutions', desc: 'Curated solutions with complexity analysis' },
    { label: 'Solutions Parser', desc: 'Node.js parser reading files' },
    { label: 'Document Builder', desc: 'docx package compiling Word templates' },
    { label: 'Word Documents', desc: 'Recruiter-shareable offline reference sheets' }
  ],
  'd2t-research': [
    { label: 'Data-to-Text', desc: 'Long-context text outputs' },
    { label: 'Fact Extractor', desc: 'Mapping generated text to SPO triples' },
    { label: 'Graph Comparator', desc: 'Evaluate factual divergence against KG source' },
    { label: 'Feedback Correction', desc: 'Iterative instruction refining' }
  ],
  'inamigos-platform': [
    { label: 'Web Forms', desc: 'Onboarding & donation pages' },
    { label: 'Express Router', desc: 'Request routing & field validations' },
    { label: 'Razorpay / Stripe', desc: 'NGO payment gateway transactional webhooks' },
    { label: 'JSON DB Document', desc: 'Mongoose models storing volunteer profiles' }
  ]
};

const compileSteps = [
  'Initializing workspace container...',
  'Checking system node capabilities...',
  'Resolving remote package dependencies...',
  'Downloading package components...',
  'Compiling TypeScript strict bindings...',
  'Executing security vulnerability scanning...',
  'Bundling distribution chunks via Rollup...',
  'Verifying sandbox integrity...',
  'Linking executable build directories...',
  'SUCCESS: Application compiled successfully.'
];

export const ProjectsApp: React.FC = () => {
  const { addNotification } = useNotificationStore();
  const { projects } = useTelemetryStore();
  const { openWindow, setBrowserUrl } = useWindowStore();
  const [selectedProj, setSelectedProj] = useState<Project>(projects[0] || projectsData[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // State for execution simulation
  const [execStatus, setExecStatus] = useState<Record<string, 'idle' | 'building' | 'running'>>({});
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  
  // Compiler Popup Telemetry States
  const [compilingProj, setCompilingProj] = useState<Project | null>(null);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [isCompileFinished, setIsCompileFinished] = useState(false);

  // Timer references for log streaming
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Compiler Effect
  useEffect(() => {
    if (!compilingProj) return;

    let step = 0;
    const interval = setInterval(() => {
      if (step < compileSteps.length) {
        setCompileLogs(prev => [...prev, `[BUILD] ${compileSteps[step]}`]);
        setCompileProgress(Math.min((step + 1) * 10, 100));
        step++;
      } else {
        clearInterval(interval);
        setIsCompileFinished(true);
        setExecStatus(prev => ({ ...prev, [compilingProj.id]: 'running' }));
        addNotification(`Package ${compilingProj.title} compiled successfully.`, 'success');
      }
    }, 220);

    return () => clearInterval(interval);
  }, [compilingProj]);

  // Auto-scroll console to bottom when logs update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeLogs]);

  // Load existing logs or status if selection changes
  useEffect(() => {
    const status = execStatus[selectedProj.id] || 'idle';
    if (status === 'running') {
      setActiveLogs(simulatedLogs[selectedProj.id] || []);
    } else if (status === 'building') {
      setActiveLogs(['$ shadowos pkg load @shadowos/' + selectedProj.id, '[SYSTEM] Compiling dependency trees...', '[SYSTEM] Assembling sandbox environment...']);
    } else {
      setActiveLogs([`$ shadowos pkg status @shadowos/${selectedProj.id}`, `Package is currently idle. Ready to execute.`]);
    }
  }, [selectedProj, execStatus]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  const handleExecute = (project: Project) => {
    if (execStatus[project.id] === 'running' || execStatus[project.id] === 'building') {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      setExecStatus(prev => ({ ...prev, [project.id]: 'idle' }));
      addNotification(`Stopped execution for ${project.title}`, 'info');
      setActiveLogs([`$ shadowos pkg terminate @shadowos/${project.id}`, `Process terminated successfully.`]);
      return;
    }

    setCompilingProj(project);
    setCompileProgress(0);
    setCompileLogs([]);
    setIsCompileFinished(false);

    setExecStatus(prev => ({ ...prev, [project.id]: 'building' }));
    addNotification(`Compiling package @shadowos/${project.id}...`, 'info', 1000);
    
    let currentLogIndex = 0;
    const allLogs = simulatedLogs[project.id] || [`$ shadowos run ${project.id}`, '[OK] Running...'];
    const initialLogs = [
      `$ shadowos pkg load @shadowos/${project.id}`,
      `[SYSTEM] Allocating sandbox environment (${project.size})...`,
      `[SYSTEM] Compiling compiler headers for version ${project.version}...`
    ];
    
    setActiveLogs(initialLogs);

    // After a short delay matching compiled modal progress, show logs in detail console
    setTimeout(() => {
      setExecStatus(prev => ({ ...prev, [project.id]: 'running' }));
      
      setActiveLogs([allLogs[0]]);
      currentLogIndex = 1;
      
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      
      streamIntervalRef.current = setInterval(() => {
        if (currentLogIndex < allLogs.length) {
          setActiveLogs(prev => [...prev, allLogs[currentLogIndex]]);
          currentLogIndex++;
        } else {
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
          }
        }
      }, 350);
    }, 2200);
  };

  // Category navigation items
  const categories = [
    { key: 'all', label: 'All Packages', count: projects.length },
    { key: 'nlp', label: 'NLP / Text', count: projects.filter(p => p.category === 'nlp').length },
    { key: 'agents', label: 'Agentic AI', count: projects.filter(p => p.category === 'agents').length },
    { key: 'vision', label: 'Computer Vision', count: projects.filter(p => p.category === 'vision').length },
    { key: 'fullstack', label: 'Full-Stack SaaS', count: projects.filter(p => p.category === 'fullstack').length },
    { key: 'data', label: 'Data & Infra', count: projects.filter(p => p.category === 'data').length },
  ];

  // Filtering logic
  const filteredProjects = projects.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTechColorClass = (tech: string): string => {
    const t = tech.toLowerCase();
    if (t.includes('python')) return 'text-accent-cyan border-accent-cyan/35 bg-accent-cyan/5';
    if (t.includes('react') || t.includes('redux') || t.includes('vite')) return 'text-accent-violet border-accent-violet/35 bg-accent-violet/5';
    if (t.includes('fastapi') || t.includes('node') || t.includes('express')) return 'text-accent-green border-accent-green/35 bg-accent-green/5';
    if (t.includes('pytorch') || t.includes('opencv') || t.includes('yolov8') || t.includes('mediapipe')) return 'text-accent-pink border-accent-pink/35 bg-accent-pink/5';
    if (t.includes('mongodb') || t.includes('supabase') || t.includes('faiss')) return 'text-accent-amber border-accent-amber/35 bg-accent-amber/5';
    return 'text-white/60 border-white/10 bg-white/5';
  };

  return (
    <div className="w-full h-full flex bg-[#c0c0c0] font-pixel text-black overflow-hidden p-2 select-none">
      
      {/* LEFT COLUMN: Folders Directory list */}
      <div className="w-[45%] flex flex-col min-w-0 h-full p-1">
        {/* Directory List Box Header */}
        <div className="flex justify-between items-center text-xs font-bold bg-[#808080] text-white px-2 py-1 border border-t-white border-l-white border-b-black border-r-black mb-1 select-none">
          <span>Folder</span>
          <span>Size</span>
        </div>

        {/* Directory Scroll Box (white inset) */}
        <div className="flex-1 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white overflow-y-auto select-none p-1">
          {filteredProjects.map((project: Project) => {
            const isSelected = selectedProj.id === project.id;
            return (
              <div
                key={project.id}
                onClick={() => setSelectedProj(project)}
                className={`flex justify-between items-center px-2 py-1 text-sm cursor-pointer select-none ${
                  isSelected 
                    ? 'bg-[#000080] text-white font-bold' 
                    : 'text-black hover:bg-[#e0e0e0]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>📁</span>
                  <span className="truncate">{project.title.replace(/\s+/g, '')}</span>
                </div>
                <span className="font-mono text-xs pl-2 shrink-0">{project.size}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Summary Details & Execute Action */}
      <div className="w-[55%] flex flex-col h-full p-1 pl-2">
        
        {/* Project Detail Box (White Inset card matching retro specs) */}
        <div className="flex-1 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 flex flex-col gap-4 overflow-y-auto select-none leading-tight">
          
          {/* Summary Heading */}
          <div>
            <h3 className="text-base font-bold bg-[#000080] text-white px-2 py-0.5 border border-t-white border-l-white border-b-black border-r-black select-none uppercase tracking-wider mb-2">
              SUMMARY
            </h3>
            <p className="text-sm text-black leading-relaxed whitespace-pre-line">
              {selectedProj.longDesc || selectedProj.shortDesc}
            </p>
          </div>

          {/* Tech Stack Heading */}
          <div>
            <h4 className="text-sm font-bold bg-[#808080] text-white px-2 py-0.5 border border-t-white border-l-white border-b-black border-r-black select-none uppercase mb-2">
              Tech Stack
            </h4>
            <p className="text-xs text-black font-bold">
              {selectedProj.tech.join(', ')}
            </p>
          </div>

          {/* Project Details */}
          <div className="text-[11px] border-t border-[#808080] pt-2 text-[#404040] font-bold">
            <div>Version: v{selectedProj.version}</div>
            <div>Directory: @shadowos/{selectedProj.id}</div>
            {selectedProj.stars !== undefined && <div>Stars: ★ {selectedProj.stars}</div>}
          </div>
        </div>

        {/* Action executing area */}
        <div className="mt-2 flex flex-col items-center gap-1.5 select-none shrink-0">
          <button
            onClick={() => handleExecute(selectedProj)}
            disabled={execStatus[selectedProj.id] === 'building'}
            className="w-full py-2 bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white active:bg-[#dfdfdf] font-pixel font-bold text-base tracking-widest outline-none cursor-pointer"
          >
            {execStatus[selectedProj.id] === 'running' ? 'TERMINATE' : 'EXEUETE'}
          </button>
          
          <span className="text-[10px] text-center font-bold text-black/70">
            (Run Compiler Building Layer & Launch GitHub Repo)
          </span>
        </div>
      </div>

      {/* Compiler Simulation Modal Overlay */}
      {compilingProj && (
        <div className="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black w-full max-w-sm p-1 shadow-2xl font-pixel select-none">
            {/* Header */}
            <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center text-sm font-bold border border-t-white/20 border-l-white/20">
              <span className="text-xs">SANDBOX_BUILDER // @shadowos/{compilingProj.id}</span>
              <button 
                onClick={() => setCompilingProj(null)} 
                className="w-[16px] h-[14px] bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black flex items-center justify-center text-[9px] text-black font-bold outline-none"
              >
                ✕
              </button>
            </div>

            {/* Content Area */}
            <div className="p-3 flex flex-col gap-3">
              {/* Scrollable logs screen (black inset) */}
              <div className="bg-[#000000] border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-2 h-36 overflow-y-auto flex flex-col gap-1 text-[11px] text-[#00f5a0] leading-normal font-mono select-text scrollbar-thin">
                {compileLogs.map((log, idx) => {
                  const isSuccess = log.includes('SUCCESS');
                  return (
                    <div key={idx} className={isSuccess ? 'text-[#00ff00] font-bold' : 'text-[#fbbf24]'}>
                      {log}
                    </div>
                  );
                })}
                {!isCompileFinished && (
                  <div className="text-cyan-400 animate-pulse">
                    Compiling environment nodes...
                  </div>
                )}
              </div>

              {/* Progress metrics */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-bold text-black">
                  <span>COMPILATION STATS</span>
                  <span>{compileProgress}% COMPLETE</span>
                </div>
                <div className="w-full bg-[#dfdfdf] border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white h-5 overflow-hidden p-[2px]">
                  <div 
                    className="bg-[#000080] h-full" 
                    style={{ width: `${compileProgress}%` }}
                  />
                </div>
              </div>

              {/* Action panel */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setCompilingProj(null)}
                  className="px-4 py-1 bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs outline-none cursor-pointer"
                >
                  Cancel
                </button>
                {isCompileFinished && (
                  <button
                    onClick={() => {
                      setBrowserUrl(compilingProj.github);
                      openWindow('browser');
                      setCompilingProj(null);
                    }}
                    className="px-4 py-1 bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs font-bold outline-none cursor-pointer"
                  >
                    LAUNCH REPO
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
