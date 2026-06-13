export interface SkillMetric {
  subject: string;
  value: number;
  fullMark: number;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export const radarSkillsData: SkillMetric[] = [
  { subject: 'AI/ML', value: 92, fullMark: 100 },
  { subject: 'Full-Stack', value: 88, fullMark: 100 },
  { subject: 'DSA', value: 85, fullMark: 100 },
  { subject: 'System Design', value: 80, fullMark: 100 },
  { subject: 'Research', value: 75, fullMark: 100 },
];

export const categorizedSkills: SkillGroup[] = [
  {
    category: 'Languages',
    items: ['C++', 'C', 'Python', 'Java', 'JavaScript', 'R', 'SQL', 'HTML5/CSS3'],
  },
  {
    category: 'AI & Data',
    items: ['PyTorch', 'TensorFlow', 'OpenCV', 'NumPy', 'Pandas', 'Scikit-Learn', 'CUDA', 'Streamlit'],
  },
  {
    category: 'Backend & Web',
    items: ['FastAPI', 'Flask', 'Node.js', 'Express', 'React 18', 'React Native', 'Tailwind CSS'],
  },
  {
    category: 'Cloud & Tooling',
    items: ['AWS', 'Git/GitHub', 'GitHub Actions', 'Linux', 'Bash', 'Render', 'Anaconda', 'Gunicorn', 'Supabase', 'MongoDB', 'PostgreSQL'],
  },
];
