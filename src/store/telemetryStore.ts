import { create } from 'zustand';
import { radarSkillsData, categorizedSkills, SkillMetric, SkillGroup } from '../data/skills';
import { projectsData, Project } from '../data/projects';

export interface LanguageInfo {
  name: string;
  percentage: number;
  color: string;
}

export interface GithubStats {
  stars: number;
  commits: number;
  prs: number;
  issues: number;
  contributions: number;
  currentStreak: number;
  longestStreak: number;
  publicRepos: number;
  rank: string;
  languages: LanguageInfo[];
  activity: { day: string; count: number }[];
}

export interface LeetcodeStats {
  solved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  contestRating: number;
  contestAttend: number;
  contestTopPercentage: number;
  contestGlobalRanking: number;
}

interface TelemetryStore {
  githubData: GithubStats;
  leetcodeData: LeetcodeStats;
  radarSkills: SkillMetric[];
  categorizedSkills: SkillGroup[];
  projects: Project[];
  lastSynced: number | null;
  isSyncing: boolean;
  initialize: () => void;
  sync: () => Promise<void>;
}

const DEFAULT_GITHUB: GithubStats = {
  stars: 0,
  commits: 103,
  prs: 0,
  issues: 0,
  contributions: 125,
  currentStreak: 1,
  longestStreak: 8,
  publicRepos: 19,
  rank: 'C',
  languages: [
    { name: 'Python', percentage: 92.90, color: '#3572A5' },
    { name: 'Jupyter Notebook', percentage: 3.38, color: '#DA5B0B' },
    { name: 'Cython', percentage: 2.41, color: '#F18E33' },
    { name: 'C', percentage: 0.88, color: '#555555' },
    { name: 'C++', percentage: 0.23, color: '#f34b7d' },
    { name: 'JavaScript', percentage: 0.20, color: '#f1e05a' },
  ],
  activity: [
    { day: '14', count: 0 }, { day: '15', count: 0 }, { day: '16', count: 0 }, { day: '17', count: 0 },
    { day: '18', count: 8 }, { day: '19', count: 0 }, { day: '20', count: 0 }, { day: '21', count: 0 },
    { day: '22', count: 0 }, { day: '23', count: 1 }, { day: '24', count: 4 }, { day: '25', count: 4 },
    { day: '26', count: 9 }, { day: '27', count: 1 }, { day: '28', count: 6 }, { day: '29', count: 0 },
    { day: '30', count: 6 }, { day: '31', count: 0 }, { day: '1', count: 1 }, { day: '2', count: 1 },
    { day: '3', count: 0 }, { day: '4', count: 0 }, { day: '5', count: 0 }, { day: '6', count: 0 },
    { day: '7', count: 1 }, { day: '8', count: 0 }, { day: '9', count: 2 }, { day: '10', count: 0 },
    { day: '11', count: 0 }, { day: '12', count: 12 }, { day: '13', count: 0 }
  ]
};

const DEFAULT_LEETCODE: LeetcodeStats = {
  solved: 357,
  easySolved: 172,
  mediumSolved: 167,
  hardSolved: 18,
  ranking: 358200,
  contestRating: 1714.24,
  contestAttend: 31,
  contestTopPercentage: 12.57,
  contestGlobalRanking: 107758
};

// Calculate skills dynamically based on telemetry values
const calculateSkills = (github: GithubStats, leetcode: LeetcodeStats): SkillMetric[] => {
  // DSA score: based on solved problems and contest rating
  const dsaValue = Math.max(80, Math.min(98, Math.round(50 + (leetcode.solved / 6) + (leetcode.contestRating - 1500) / 10)));
  
  // AI/ML: Python usage + specific repo check
  const pythonLang = github.languages.find(l => l.name === 'Python');
  const pythonWeight = pythonLang ? pythonLang.percentage : 80;
  const aiValue = Math.max(82, Math.min(96, Math.round(78 + (pythonWeight / 10) + (github.publicRepos / 4))));

  // Full-Stack: JS/TS/HTML languages count & dynamic repo scaling
  const webLangs = github.languages.filter(l => ['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(l.name));
  const webWeight = webLangs.reduce((acc, l) => acc + l.percentage, 0);
  const fsValue = Math.max(80, Math.min(95, Math.round(75 + (webWeight > 0 ? webWeight / 8 : 10) + (github.publicRepos / 4))));

  // System Design: scaled with total repos and contributions
  const sdValue = Math.max(75, Math.min(92, Math.round(72 + (github.publicRepos / 2) + Math.min(8, github.stars))));

  // Research: scaled with contributions
  const resValue = Math.max(70, Math.min(88, Math.round(68 + Math.min(15, github.contributions / 10))));

  return [
    { subject: 'AI/ML', value: aiValue, fullMark: 100 },
    { subject: 'Full-Stack', value: fsValue, fullMark: 100 },
    { subject: 'DSA', value: dsaValue, fullMark: 100 },
    { subject: 'System Design', value: sdValue, fullMark: 100 },
    { subject: 'Research', value: resValue, fullMark: 100 },
  ];
};

// Merge dynamically found languages into the categorized list
const mergeCategorizedSkills = (githubLangs: LanguageInfo[]): SkillGroup[] => {
  const baseCategories = [...categorizedSkills];
  const langGroupIdx = baseCategories.findIndex(c => c.category === 'Languages');
  if (langGroupIdx !== -1) {
    const existingLangs = new Set(baseCategories[langGroupIdx].items.map(l => l.toLowerCase()));
    const newLangs = [...baseCategories[langGroupIdx].items];
    githubLangs.forEach(lang => {
      const name = lang.name;
      if (name && !existingLangs.has(name.toLowerCase()) && name !== 'Jupyter Notebook' && name !== 'HTML' && name !== 'CSS') {
        newLangs.push(name);
      }
    });
    baseCategories[langGroupIdx] = {
      ...baseCategories[langGroupIdx],
      items: newLangs
    };
  }
  return baseCategories;
};

// Sync repository stars into our static projects metadata
const syncProjectsWithGithub = (repos: any[]): Project[] => {
  return projectsData.map(p => {
    const matchingRepo = repos.find(r => {
      const name = r.name.toLowerCase();
      const projId = p.id.toLowerCase();
      return name === projId || 
             name === projId.replace('-', '') || 
             name === projId.replace('-', '_') ||
             (projId === 'pilot-os' && name === 'autopilot-os') ||
             (projId === 'secure-storage' && name === 'secure_cloud_storage') ||
             (projId === 'sign-language' && name === 'sign-language-recognition-system') ||
             (projId === 'rag-assistant' && name === 'personal-ai-knowledge-assistant');
    });

    if (matchingRepo) {
      return {
        ...p,
        stars: matchingRepo.stargazers_count || 0,
      };
    }
    return p;
  });
};

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  githubData: DEFAULT_GITHUB,
  leetcodeData: DEFAULT_LEETCODE,
  radarSkills: radarSkillsData,
  categorizedSkills: categorizedSkills,
  projects: projectsData,
  lastSynced: null,
  isSyncing: false,

  initialize: () => {
    try {
      const cached = localStorage.getItem('shadowos_telemetry');
      if (cached) {
        const parsed = JSON.parse(cached);
        set({
          githubData: parsed.githubData || DEFAULT_GITHUB,
          leetcodeData: parsed.leetcodeData || DEFAULT_LEETCODE,
          radarSkills: parsed.radarSkills || radarSkillsData,
          categorizedSkills: parsed.categorizedSkills || categorizedSkills,
          projects: parsed.projects || projectsData,
          lastSynced: parsed.lastSynced || null
        });
      }
    } catch (e) {
      console.warn('Failed to parse cached telemetry:', e);
    }

    // Trigger initial background sync
    const last = get().lastSynced;
    const sixHours = 6 * 60 * 60 * 1000;
    if (!last || Date.now() - last > sixHours) {
      get().sync();
    }

    // Set periodic sync every 15 minutes
    setInterval(() => {
      get().sync();
    }, 15 * 60 * 1000);
  },

  sync: async () => {
    if (get().isSyncing) return;
    set({ isSyncing: true });

    let updatedGithub = { ...get().githubData };
    let updatedLeetcode = { ...get().leetcodeData };
    let fetchedRepos: any[] = [];

    // 1. Fetch GitHub data
    try {
      const userRes = await fetch('https://api.github.com/users/X-ImLucky-X');
      if (userRes.ok) {
        const userData = await userRes.json();
        updatedGithub.publicRepos = userData.public_repos || updatedGithub.publicRepos;
      }

      const reposRes = await fetch('https://api.github.com/users/X-ImLucky-X/repos?per_page=100');
      if (reposRes.ok) {
        fetchedRepos = await reposRes.json();
        let starsSum = 0;
        const langCounts: Record<string, number> = {};
        let totalLangRepos = 0;

        fetchedRepos.forEach((repo: any) => {
          starsSum += repo.stargazers_count || 0;
          if (repo.language) {
            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
            totalLangRepos++;
          }
        });

        updatedGithub.stars = starsSum;

        const colorPalette: Record<string, string> = {
          'Python': '#3572A5',
          'Jupyter Notebook': '#DA5B0B',
          'Cython': '#F18E33',
          'C': '#555555',
          'C++': '#f34b7d',
          'JavaScript': '#f1e05a',
          'TypeScript': '#3178c6',
          'HTML': '#e34c26',
          'CSS': '#563d7c'
        };

        const computedLanguages = Object.entries(langCounts)
          .map(([name, count]) => {
            const percentage = totalLangRepos > 0 ? (count / totalLangRepos) * 100 : 0;
            const color = colorPalette[name] || '#' + Math.floor(Math.random()*16777215).toString(16);
            return { name, percentage, color };
          })
          .sort((a, b) => b.percentage - a.percentage);

        if (computedLanguages.length > 0) {
          updatedGithub.languages = computedLanguages;
        }

        // Calculate rank
        let rank = 'C';
        const totalScore = (updatedGithub.publicRepos * 5) + (starsSum * 10) + updatedGithub.commits;
        if (totalScore > 300) rank = 'A';
        else if (totalScore > 150) rank = 'B';
        updatedGithub.rank = rank;
      }

      // Fetch GitHub commits/activity
      const eventsRes = await fetch('https://api.github.com/users/X-ImLucky-X/events');
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const dailyContributions: Record<string, number> = {};
        const datesList = [];

        for (let i = 30; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          dailyContributions[dateStr] = 0;
          datesList.push({
            fullDate: dateStr,
            day: String(d.getDate())
          });
        }

        let commitsCountThisMonth = 0;
        eventsData.forEach((evt: any) => {
          if (evt.created_at) {
            const dateStr = evt.created_at.split('T')[0];
            if (dailyContributions[dateStr] !== undefined) {
              if (evt.type === 'PushEvent' && evt.payload && evt.payload.size) {
                dailyContributions[dateStr] += evt.payload.size;
                commitsCountThisMonth += evt.payload.size;
              } else {
                dailyContributions[dateStr] += 1;
                commitsCountThisMonth += 1;
              }
            }
          }
        });

        const hasLiveData = Object.values(dailyContributions).some(c => c > 0);
        if (hasLiveData) {
          updatedGithub.activity = datesList.map(item => ({
            day: item.day,
            count: dailyContributions[item.fullDate]
          }));
          updatedGithub.contributions = 125 + commitsCountThisMonth;
          updatedGithub.commits = 103 + commitsCountThisMonth;
        }
      }
    } catch (err) {
      console.warn('Failed to sync GitHub telemetry:', err);
    }

    // 2. Fetch LeetCode data
    try {
      const [profileRes, solvedRes, contestRes] = await Promise.all([
        fetch('https://alfa-leetcode-api.onrender.com/lakshyakumarsingh1'),
        fetch('https://alfa-leetcode-api.onrender.com/lakshyakumarsingh1/solved'),
        fetch('https://alfa-leetcode-api.onrender.com/lakshyakumarsingh1/contest')
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        updatedLeetcode.ranking = profileData.ranking || updatedLeetcode.ranking;
      }
      if (solvedRes.ok) {
        const solvedData = await solvedRes.json();
        updatedLeetcode.solved = solvedData.solvedProblem || updatedLeetcode.solved;
        updatedLeetcode.easySolved = solvedData.easySolved || updatedLeetcode.easySolved;
        updatedLeetcode.mediumSolved = solvedData.mediumSolved || updatedLeetcode.mediumSolved;
        updatedLeetcode.hardSolved = solvedData.hardSolved || updatedLeetcode.hardSolved;
      }
      if (contestRes.ok) {
        const contestData = await contestRes.json();
        updatedLeetcode.contestRating = contestData.contestRating || updatedLeetcode.contestRating;
        updatedLeetcode.contestAttend = contestData.contestAttend || updatedLeetcode.contestAttend;
        updatedLeetcode.contestTopPercentage = contestData.contestTopPercentage || updatedLeetcode.contestTopPercentage;
        updatedLeetcode.contestGlobalRanking = contestData.contestGlobalRanking || updatedLeetcode.contestGlobalRanking;
      }
    } catch (err) {
      console.warn('Failed to sync LeetCode telemetry:', err);
    }

    // 3. Compute dynamic states
    const nextRadarSkills = calculateSkills(updatedGithub, updatedLeetcode);
    const nextCategorizedSkills = mergeCategorizedSkills(updatedGithub.languages);
    const nextProjects = fetchedRepos.length > 0 ? syncProjectsWithGithub(fetchedRepos) : get().projects;

    // 4. Update store and save to cache
    const finalState = {
      githubData: updatedGithub,
      leetcodeData: updatedLeetcode,
      radarSkills: nextRadarSkills,
      categorizedSkills: nextCategorizedSkills,
      projects: nextProjects,
      lastSynced: Date.now(),
      isSyncing: false
    };

    set(finalState);
    try {
      localStorage.setItem('shadowos_telemetry', JSON.stringify(finalState));
    } catch (e) {
      console.warn('Failed to cache telemetry data:', e);
    }
  }
}));
