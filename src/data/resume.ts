export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  points: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  period: string;
  grade?: string;
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  location: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: string[];
}

export const resumeData: ResumeData = {
  name: 'Lakshya Kumar Singh',
  title: 'AI Engineer & Systems Developer',
  email: 'lakshyakumarsingh1@gmail.com',
  phone: '+91 89238 94012',
  github: 'https://github.com/X-ImLucky-X',
  linkedin: 'https://www.linkedin.com/in/lakshya-kumar-singh-62142128b/',
  location: 'Chennai, Tamil Nadu',
  summary: 'B.Tech Computer Science (AI & ML) student at VIT Chennai (Expected Graduation: 2027) with hands-on experience in machine learning, web development, and generative AI. Strong foundation in data structures, algorithms, and building scalable applications.',
  experience: [
    {
      id: 'exp-gdsc',
      role: 'Tech Member',
      company: 'Google Developer Student Club (GDSC), VIT Chennai',
      location: 'Chennai, India',
      period: '2024 – Present',
      points: [
        'Organized technical events and workshops; supported outreach initiatives.',
        'Worked with Google developer tools and emerging technologies.'
      ]
    },
    {
      id: 'exp-freelance',
      role: 'Machine Learning Developer (Freelance)',
      company: 'Independent Contractor',
      location: 'Remote',
      period: '2023 – Present',
      points: [
        'Trained and deployed custom computer vision pipelines (YOLOv8, MediaPipe) for client research projects.',
        'Developed RAG tools and automation scripts for small-scale office deployments.',
        'Refactored full-stack REST API schemas, optimizing database response speeds.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-vit',
      degree: 'B.Tech in Computer Science and Engineering (AI & ML)',
      institution: 'Vellore Institute of Technology (VIT), Chennai',
      location: 'Chennai, India',
      period: 'Expected 2027',
      grade: 'CGPA: 8.55'
    },
    {
      id: 'edu-xii',
      degree: 'Class XII (CBSE)',
      institution: 'St. Fidelis Sr. Sec. School',
      location: 'Aligarh, India',
      period: '2023',
      grade: 'Percentage: 86.2%'
    },
    {
      id: 'edu-x',
      degree: 'Class X (CBSE)',
      institution: 'St. Fidelis Sr. Sec. School',
      location: 'Aligarh, India',
      period: '2021',
      grade: 'Percentage: 91.2%'
    }
  ],
  certifications: [
    'Advanced Learning Algorithms – DeepLearning.AI (2025)',
    'Supervised Machine Learning – DeepLearning.AI, Stanford (2025)',
    'Blockchain Developer – IBM (2025)',
    'Mastering DSA with C/C++ – Udemy (2025)',
    'Cisco Packet Tracer Networking (2025)'
  ]
};
