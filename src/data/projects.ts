export interface Project {
  id: string;
  title: string;
  category: 'nlp' | 'agents' | 'vision' | 'fullstack' | 'data';
  categoryLabel: string;
  shortDesc: string;
  longDesc: string;
  tech: string[];
  github: string;
  demo?: string;
  version: string;
  size: string;
}

export const projectsData: Project[] = [
  {
    id: 'toxic-comments',
    title: 'Toxic Comment Classification',
    category: 'nlp',
    categoryLabel: 'NLP / text',
    shortDesc: 'Multi-label NLP content classifier targeting six toxicity categories.',
    longDesc: 'Engineered a preprocessing pipeline covering profanity filtering and emoji normalization. Benchmark tests mapped Logistic Regression, LSTMs, and DistilBERT. Shipped a GloVe+GRU architecture for deployment efficiency, achieving 98.5% validation accuracy. Features a Flask Web UI with prediction indicators.',
    tech: ['Python', 'TensorFlow/Keras', 'GloVe Embeddings', 'Flask', 'Pandas', 'Scikit-Learn'],
    github: 'https://github.com/X-ImLucky-X/Toxic-Comment-Classification',
    version: '1.2.0',
    size: '14.5 MB',
  },
  {
    id: 'voxmail',
    title: 'VoxMail AI Assistant',
    category: 'agents',
    categoryLabel: 'Agentic AI',
    shortDesc: 'Privacy-first offline email agent utilizing local LLMs.',
    longDesc: 'A native email productivity environment using local Ollama (Qwen 2.5 7B) nodes. Connects a dual-agent structure (Triage & Draft generation) with Gmail OAuth credentials. Implements Supabase user schemas and PostgreSQL session logs.',
    tech: ['React Native', 'FastAPI', 'Supabase', 'PostgreSQL', 'Ollama', 'Qwen 2.5', 'Gmail API', 'JWT'],
    github: 'https://github.com/X-ImLucky-X/voxmail-ai',
    version: '2.0.4',
    size: '8.2 MB',
  },
  {
    id: 'secure-storage',
    title: 'Secure Cloud Storage',
    category: 'fullstack',
    categoryLabel: 'Full-Stack SaaS',
    shortDesc: 'End-to-end encrypted storage proxy for Google Drive layers.',
    longDesc: 'Encrypts files client-side before server uploads using AES-GCM 256-bit cryptography. File names and MIME details are packaged inside the encrypted byte array. Implements a React interface feeding an Express proxy into a FastAPI Python controller.',
    tech: ['React', 'FastAPI', 'Express.js', 'PyCryptodome', 'Google Drive API', 'OAuth 2.0'],
    github: 'https://github.com/X-ImLucky-X/Secure_Cloud_Storage',
    version: '1.0.1',
    size: '5.1 MB',
  },
  {
    id: 'pilot-os',
    title: 'PilotOS Autopilot Engine',
    category: 'agents',
    categoryLabel: 'Agentic AI',
    shortDesc: 'Autonomous multi-agent LangGraph workflow manager.',
    longDesc: 'An agentic operating environment triggering multi-step tasks from single prompt strings. Connects specialized sub-agents (Research, Gmail, and Google Calendar tools) orchestrated by LangGraph nodes. Features a dashboard with log streams.',
    tech: ['React', 'TailwindCSS', 'Framer Motion', 'FastAPI', 'LangGraph', 'Ollama', 'Gmail API', 'Google Calendar API'],
    github: 'https://github.com/X-ImLucky-X/autopilot-os',
    version: '0.9.5-beta',
    size: '11.4 MB',
  },
  {
    id: 'sign-language',
    title: 'Enhanced Sign Language Recognition',
    category: 'vision',
    categoryLabel: 'Computer Vision',
    shortDesc: 'Real-time gesture text-to-speech converter using MediaPipe.',
    longDesc: 'A webcam sign language interpreter. Extracts 21 MediaPipe skeletal node landmarks, eliminating background noises to optimize classification accuracy. Feeds a TensorFlow CNN to output character lists, compiling words with pyttsx3 speech.',
    tech: ['Python', 'OpenCV', 'MediaPipe', 'TensorFlow/Keras', 'pyttsx3'],
    github: 'https://github.com/X-ImLucky-X/Sign-Language-Recognition-System',
    version: '1.4.0',
    size: '22.1 MB',
  },
  {
    id: 'wealthflow',
    title: 'WealthFlow SaaS Dashboard',
    category: 'fullstack',
    categoryLabel: 'Full-Stack SaaS',
    shortDesc: 'AI-assisted finance dashboard with charts and MongoDB.',
    longDesc: 'A wealth planner SaaS displaying monthly transaction trends, category breakdowns, and budget limits. Uses FastAPI backend controllers, MongoDB Atlas schemas, and an Ollama advisory agent.',
    tech: ['React', 'Vite', 'TailwindCSS', 'Recharts', 'FastAPI', 'MongoDB Atlas', 'Motor', 'LangGraph', 'Ollama'],
    github: 'https://github.com/X-ImLucky-X/WEALTHFLOW',
    version: '2.1.0',
    size: '7.8 MB',
  },
  {
    id: 'shophub',
    title: 'ShopHub E-Commerce Store',
    category: 'fullstack',
    categoryLabel: 'Full-Stack SaaS',
    shortDesc: 'Full MERN online store with Razorpay checkout.',
    longDesc: 'An e-commerce storefront containing product browsing grids, persistent shopping carts, and order checkout flows. Integrates secure Razorpay payments, Mongoose DB connections, and an administrative manager dashboard.',
    tech: ['React', 'TailwindCSS', 'Vite', 'Node.js', 'Express.js', 'MongoDB Atlas', 'Mongoose', 'Razorpay', 'JWT'],
    github: 'https://github.com/X-ImLucky-X/ShopHub',
    demo: 'https://shop-hub-pi-one.vercel.app/',
    version: '1.0.0',
    size: '9.4 MB',
  },
  {
    id: 'adas-lane',
    title: 'Lane & Vehicle ADAS Simulation',
    category: 'vision',
    categoryLabel: 'Computer Vision',
    shortDesc: 'Real-time ADAS lane detection and YOLOv8 vehicle alarm.',
    longDesc: 'A computer vision safety simulation. Employs Canny edges and Hough Transforms with Exponential Moving Average filters to smoothly overlay lane markings. Combines YOLOv8 trackers to estimate vehicle proximity.',
    tech: ['Python', 'OpenCV', 'YOLOv8', 'PyTorch', 'NumPy'],
    github: 'https://github.com/X-ImLucky-X/Lane-Detection',
    version: '0.8.0',
    size: '48.2 MB',
  },
  {
    id: 'rag-assistant',
    title: 'Personal AI Knowledge Base',
    category: 'nlp',
    categoryLabel: 'NLP / Text',
    shortDesc: 'FAISS-based RAG chat system referencing PDF documentation.',
    longDesc: 'A document assistant. Processes PDF text, embeds chunks via HuggingFace transformers, and indexes vectors in a local FAISS store. Uses Groq (Llama 3.1) prompting to ground conversational answers.',
    tech: ['FastAPI', 'LangChain', 'FAISS', 'HuggingFace Embeddings', 'Groq', 'Llama 3.1', 'Streamlit', 'PyMuPDF'],
    github: 'https://github.com/X-ImLucky-X/Personal-AI-Knowledge-Assistant',
    version: '1.5.2',
    size: '6.4 MB',
  },
  {
    id: 'data-forge',
    title: 'AutoDataForge Pipeline',
    category: 'data',
    categoryLabel: 'Data & Infra',
    shortDesc: 'Staged text cleaning and LLM QA generation pipeline.',
    longDesc: `AutoDataForge is a modular, end-to-end AI training data preparation system. It transforms raw documents into high-quality, model-ready training datasets.

📌 PROBLEM STATEMENT
Training modern AI models requires large amounts of clean, structured data. Real-world data is unstructured, noisy, and often contains sensitive information. AutoDataForge automates the pipeline to solve this.

🎯 FEATURES
✔ Ingests .txt and .pdf documents
✔ Cleans and normalizes text deterministically
✔ Masks PII (emails, phone numbers)
✔ Generates summaries via LLM
✔ Scores and filters outputs
✔ Exports training-ready JSONL datasets

🧠 ARCHITECTURE
Raw Document → Ingestion → Cleaning → PII Masking → LLM Generation → Quality Scoring → JSONL Dataset

🛠️ TECH STACK
- Python 3.11
- PyMuPDF (PDF processing)
- OpenAI API & local LLMs
- JSONL format`,
    tech: ['Python', 'PyMuPDF', 'OpenAI API', 'python-dotenv', 'JSONL'],
    github: 'https://github.com/X-ImLucky-X/AutoDataForge',
    version: '1.1.0',
    size: '3.9 MB',
  },
  {
    id: 'leetcode-revision',
    title: 'LeetCode Revision System',
    category: 'data',
    categoryLabel: 'Data & Infra',
    shortDesc: 'Offline DSA revision engine generating formatted .docx sheets for NeetCode 150.',
    longDesc: 'A programmatically driven offline reference generator. Parses curated C++ problem solutions and outputs structured Word documents (.docx) containing problem descriptions, algorithmic analysis, complexity breakdowns, and formatted code templates.',
    tech: ['Node.js', 'C++', 'docx', 'Markdown'],
    github: 'https://github.com/X-ImLucky-X',
    version: '1.0.0',
    size: '2.4 MB',
  },
  {
    id: 'd2t-research',
    title: 'D2T Semantic Consistency Research',
    category: 'nlp',
    categoryLabel: 'NLP / Text',
    shortDesc: 'Research on semantic consistency pipelines to reduce hallucinations in long-context D2T generation.',
    longDesc: 'Proposes a fact-level verification framework to mitigate semantic divergence in long-text generation tasks. Implements fact extraction mappings onto knowledge graph triples, executing iterative correction loops over local models to prevent hallucination.',
    tech: ['Python', 'NLP', 'Knowledge Graphs', 'PyTorch', 'Transformers'],
    github: 'https://github.com/X-ImLucky-X',
    version: '0.1.0-beta',
    size: '1.2 MB',
  },
  {
    id: 'inamigos-platform',
    title: 'InAmigos NGO Platform',
    category: 'fullstack',
    categoryLabel: 'Full-Stack SaaS',
    shortDesc: 'Web platform for NGO operations covering onboarding, donation flows, and features.',
    longDesc: 'A community-driven feature platform for the InAmigos Foundation. Manages volunteer registration forms, donation processing checkout lines, and dynamic project showcase pages, leveraging a Node.js backend.',
    tech: ['JavaScript', 'Node.js', 'HTML5/CSS3', 'Express'],
    github: 'https://github.com/X-ImLucky-X',
    version: '1.1.0',
    size: '5.6 MB',
  },
];
