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

// Calculate streaks dynamically based on 30-day activity array
const calculateStreaks = (activity: { day: string; count: number }[]) => {
  let longestStreak = 0;
  let runningStreak = 0;

  const counts = activity.map(a => a.count);
  
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] > 0) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  let currentStreak = 0;
  for (let i = counts.length - 1; i >= 0; i--) {
    if (counts[i] > 0) {
      currentStreak++;
    } else {
      if (i === counts.length - 1) {
        continue;
      }
      break;
    }
  }

  return {
    currentStreak: Math.max(1, currentStreak),
    longestStreak: Math.max(8, longestStreak)
  };
};

// Sync repository stars into our static projects metadata, and dynamically append unmatched public repos
const syncProjectsWithGithub = (repos: any[]): Project[] => {
  const matchedRepoIds = new Set<number>();

  const updatedCurated = projectsData.map(p => {
    const matchingRepo = repos.find(r => {
      const name = r.name.toLowerCase();
      const projId = p.id.toLowerCase();
      return name === projId || 
             name === projId.replace(/-/g, '') || 
             name === projId.replace(/-/g, '_') ||
             (projId === 'pilot-os' && name === 'autopilot-os') ||
             (projId === 'secure-storage' && name === 'secure_cloud_storage') ||
             (projId === 'sign-language' && name === 'sign-language-recognition-system') ||
             (projId === 'rag-assistant' && name === 'personal-ai-knowledge-assistant');
    });

    if (matchingRepo) {
      matchedRepoIds.add(matchingRepo.id);
      return {
        ...p,
        stars: matchingRepo.stargazers_count || 0,
      };
    }
    return p;
  });

  const dynamicProjects: Project[] = [];

  repos.forEach(repo => {
    if (matchedRepoIds.has(repo.id)) return;
    if (repo.fork) return; // Skip forks to highlight original work

    const topics: string[] = repo.topics || [];
    let category: 'nlp' | 'agents' | 'vision' | 'fullstack' | 'data' = 'data';
    let categoryLabel = 'Data & Infra';

    const hasTopic = (keywords: string[]) => keywords.some(kw => topics.some(t => t.toLowerCase().includes(kw)));
    const nameLower = repo.name.toLowerCase();
    const descLower = (repo.description || '').toLowerCase();
    const hasText = (keywords: string[]) => keywords.some(kw => nameLower.includes(kw) || descLower.includes(kw));

    if (hasTopic(['nlp', 'llm', 'bert', 'gpt', 'transformer', 'text']) || hasText(['nlp', 'llm', 'bert', 'gpt', 'transformer', 'text-to-speech', 'speech-to-text'])) {
      category = 'nlp';
      categoryLabel = 'NLP / Text';
    } else if (hasTopic(['agent', 'langchain', 'langgraph', 'crewai', 'autogen']) || hasText(['agent', 'langchain', 'langgraph', 'crewai', 'autogen'])) {
      category = 'agents';
      categoryLabel = 'Agentic AI';
    } else if (hasTopic(['vision', 'opencv', 'yolo', 'mediapipe', 'image', 'video', 'detection']) || hasText(['vision', 'opencv', 'yolo', 'mediapipe', 'image', 'video', 'detection', 'cnn', 'object-detect'])) {
      category = 'vision';
      categoryLabel = 'Computer Vision';
    } else if (hasTopic(['web', 'react', 'vue', 'nextjs', 'angular', 'fullstack', 'saas', 'frontend', 'backend', 'saas', 'django', 'laravel']) || 
               hasText(['web', 'react', 'vue', 'nextjs', 'angular', 'fullstack', 'saas', 'frontend', 'backend', 'saas', 'django', 'laravel']) ||
               ['typescript', 'javascript', 'html', 'css'].includes((repo.language || '').toLowerCase())) {
      category = 'fullstack';
      categoryLabel = 'Full-Stack SaaS';
    }

    const title = repo.name
      .split(/[-_]+/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const sizeKB = repo.size || 0;
    const size = sizeKB >= 1024 
      ? `${(sizeKB / 1024).toFixed(1)} MB` 
      : `${sizeKB} KB`;

    dynamicProjects.push({
      id: repo.name.toLowerCase(),
      title,
      category,
      categoryLabel,
      shortDesc: repo.description || 'GitHub public repository.',
      longDesc: repo.description || 'No description provided.',
      tech: topics.length > 0 ? topics.map(t => t.toUpperCase()) : [repo.language || 'GitHub Repo'],
      github: repo.html_url,
      demo: repo.homepage || undefined,
      version: '1.0.0',
      size,
      stars: repo.stargazers_count || 0
    });
  });

  return [...updatedCurated, ...dynamicProjects];
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

        // Merge stars from cached projects into projectsData
        const cachedProjects = parsed.projects || [];
        const mergedProjects = projectsData.map(p => {
          const cachedProj = cachedProjects.find((cp: any) => cp.id === p.id);
          return cachedProj ? { ...p, stars: cachedProj.stars ?? p.stars } : p;
        });

        // Retain dynamic cached projects (those not in projectsData)
        const cachedDynamicProjects = cachedProjects.filter((cp: any) => !projectsData.some(p => p.id === cp.id));
        const allMergedProjects = [...mergedProjects, ...cachedDynamicProjects];

        // Merge languages from cached githubData into categorizedSkills
        const mergedSkills = mergeCategorizedSkills(parsed.githubData?.languages || []);

        set({
          githubData: parsed.githubData || DEFAULT_GITHUB,
          leetcodeData: parsed.leetcodeData || DEFAULT_LEETCODE,
          radarSkills: parsed.radarSkills || radarSkillsData,
          categorizedSkills: mergedSkills,
          projects: allMergedProjects,
          lastSynced: parsed.lastSynced || null
        });
      }
    } catch (e) {
      console.warn('Failed to parse cached telemetry:', e);
    }

    // Trigger initial background sync on boot if not synced in the last 2 minutes,
    // or if we don't have any dynamic projects loaded yet
    const last = get().lastSynced;
    const twoMinutes = 2 * 60 * 1000;
    const hasDynamicProjects = get().projects.length > projectsData.length;
    if (!last || Date.now() - last > twoMinutes || !hasDynamicProjects) {
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
      } else if (reposRes.status === 403) {
        console.warn('GitHub API rate limit exceeded. Using cached repository list.');
      }

      // Fetch dynamic stats from search API
      try {
        const [commitsRes, prsRes, issuesRes] = await Promise.all([
          fetch('https://api.github.com/search/commits?q=author:X-ImLucky-X'),
          fetch('https://api.github.com/search/issues?q=author:X-ImLucky-X+type:pr'),
          fetch('https://api.github.com/search/issues?q=author:X-ImLucky-X+type:issue')
        ]);

        if (commitsRes.ok) {
          const commitsData = await commitsRes.json();
          updatedGithub.commits = commitsData.total_count || updatedGithub.commits;
        }
        if (prsRes.ok) {
          const prsData = await prsRes.json();
          updatedGithub.prs = prsData.total_count || updatedGithub.prs;
        }
        if (issuesRes.ok) {
          const issuesData = await issuesRes.json();
          updatedGithub.issues = issuesData.total_count || updatedGithub.issues;
        }
      } catch (searchErr) {
        console.warn('Failed to fetch GitHub stats from search API:', searchErr);
      }

      // Fetch GitHub contributions calendar (streaks and activity graph)
      try {
        const contribsRes = await fetch('https://github-contributions-api.jogruber.de/v4/X-ImLucky-X');
        if (contribsRes.ok) {
          const contribsData = await contribsRes.json();
          const sortedContributions = contribsData.contributions || [];
          sortedContributions.sort((a: any, b: any) => a.date.localeCompare(b.date));

          let longestStreak = 0;
          let runningStreak = 0;

          const todayStr = new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          sortedContributions.forEach((day: any) => {
            if (day.date > todayStr) return;

            if (day.count > 0) {
              runningStreak++;
              if (runningStreak > longestStreak) {
                longestStreak = runningStreak;
              }
            } else {
              runningStreak = 0;
            }
          });

          let currentStreak = 0;
          const todayDay = sortedContributions.find((d: any) => d.date === todayStr);
          const yesterdayDay = sortedContributions.find((d: any) => d.date === yesterdayStr);

          if (todayDay && todayDay.count > 0) {
            let streak = 0;
            const todayIdx = sortedContributions.findIndex((d: any) => d.date === todayStr);
            if (todayIdx !== -1) {
              for (let i = todayIdx; i >= 0; i--) {
                if (sortedContributions[i].count > 0) {
                  streak++;
                } else {
                  break;
                }
              }
            }
            currentStreak = streak;
          } else if (yesterdayDay && yesterdayDay.count > 0) {
            let streak = 0;
            const yesterdayIdx = sortedContributions.findIndex((d: any) => d.date === yesterdayStr);
            if (yesterdayIdx !== -1) {
              for (let i = yesterdayIdx; i >= 0; i--) {
                if (sortedContributions[i].count > 0) {
                  streak++;
                } else {
                  break;
                }
              }
            }
            currentStreak = streak;
          }

          updatedGithub.currentStreak = Math.max(1, currentStreak);
          updatedGithub.longestStreak = Math.max(8, longestStreak);

          // Populate activity graph (last 31 days)
          let todayIdx = sortedContributions.findIndex((d: any) => d.date === todayStr);
          if (todayIdx === -1) {
            todayIdx = sortedContributions.length - 1;
          }

          const last31Days = sortedContributions.slice(Math.max(0, todayIdx - 30), todayIdx + 1);
          if (last31Days.length > 0) {
            updatedGithub.activity = last31Days.map((d: any) => {
              const parts = d.date.split('-');
              const dayNum = parseInt(parts[2], 10);
              return {
                day: String(dayNum),
                count: d.count
              };
            });
          }
        }
      } catch (contribsErr) {
        console.warn('Failed to fetch GitHub contributions stats:', contribsErr);
      }

      // Compute contributions and rank dynamically
      updatedGithub.contributions = updatedGithub.commits + updatedGithub.prs + updatedGithub.issues;
      
      let rank = 'C';
      const totalScore = (updatedGithub.publicRepos * 5) + (updatedGithub.stars * 10) + updatedGithub.commits;
      if (totalScore > 300) rank = 'A';
      else if (totalScore > 150) rank = 'B';
      updatedGithub.rank = rank;

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
