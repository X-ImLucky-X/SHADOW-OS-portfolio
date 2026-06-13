import React, { useState, useEffect } from 'react';
import { resumeData } from '../data/resume';

interface LanguageInfo {
  name: string;
  percentage: number;
  color: string;
}

interface GithubStats {
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

interface LeetcodeStats {
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

export const AboutApp: React.FC = () => {
  // Real-time Github stats state with screenshot values as highly polished default/fallbacks
  const [githubData, setGithubData] = useState<GithubStats>({
    stars: 0,
    commits: 103,
    prs: 0,
    issues: 0,
    contributions: 125,
    currentStreak: 1,
    longestStreak: 8,
    publicRepos: 10,
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
  });

  const [leetcodeData, setLeetcodeData] = useState<LeetcodeStats>({
    solved: 357,
    easySolved: 172,
    mediumSolved: 167,
    hardSolved: 18,
    ranking: 358200,
    contestRating: 1714.24,
    contestAttend: 31,
    contestTopPercentage: 12.57,
    contestGlobalRanking: 107758
  });

  useEffect(() => {
    let active = true;

    const fetchGithubData = async () => {
      try {
        // 1. Fetch User Profile for repos count
        const userRes = await fetch('https://api.github.com/users/X-ImLucky-X');
        if (!userRes.ok) throw new Error('API Rate Limit or Network Error');
        const userData = await userRes.json();

        // 2. Fetch Repositories to calculate stars and language ratio
        const reposRes = await fetch('https://api.github.com/users/X-ImLucky-X/repos?per_page=100');
        if (!reposRes.ok) throw new Error('Repos fetch failed');
        const reposData = await reposRes.json();

        let starsSum = 0;
        const langCounts: Record<string, number> = {};
        let totalLangRepos = 0;

        reposData.forEach((repo: any) => {
          starsSum += repo.stargazers_count || 0;
          if (repo.language) {
            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
            totalLangRepos++;
          }
        });

        // Compute language ratio list
        const colorPalette: Record<string, string> = {
          'Python': '#3572A5',
          'Jupyter Notebook': '#DA5B0B',
          'Cython': '#F18E33',
          'C': '#555555',
          'C++': '#f34b7d',
          'JavaScript': '#f1e05a',
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

        // 3. Fetch Event Feeds for Commit Line Chart
        const eventsRes = await fetch('https://api.github.com/users/X-ImLucky-X/events');
        let computedActivity = [...githubData.activity];
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          const dailyContributions: Record<string, number> = {};
          
          // Initialize last 30 days
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

          // Populate daily counts from event activity
          eventsData.forEach((evt: any) => {
            if (evt.created_at) {
              const dateStr = evt.created_at.split('T')[0];
              if (dailyContributions[dateStr] !== undefined) {
                if (evt.type === 'PushEvent' && evt.payload && evt.payload.size) {
                  dailyContributions[dateStr] += evt.payload.size;
                } else {
                  dailyContributions[dateStr] += 1;
                }
              }
            }
          });

          // Check if we actually have any live public commit data in the map
          const hasLiveData = Object.values(dailyContributions).some(c => c > 0);
          if (hasLiveData) {
            computedActivity = datesList.map(item => ({
              day: item.day,
              count: dailyContributions[item.fullDate]
            }));
          }
        }

        // Calculate simple Rank based on repo metrics
        let rank = 'C';
        const totalScore = (userData.public_repos * 5) + (starsSum * 10) + 103;
        if (totalScore > 300) rank = 'A';
        else if (totalScore > 150) rank = 'B';

        if (active) {
          setGithubData({
            stars: starsSum,
            commits: 103, // base commits
            prs: 0,
            issues: 0,
            contributions: 125, // default baseline
            currentStreak: 1,
            longestStreak: 8,
            publicRepos: userData.public_repos || reposData.length,
            rank,
            languages: computedLanguages.length > 0 ? computedLanguages : githubData.languages,
            activity: computedActivity
          });
        }
      } catch (err) {
        console.warn('Using offline fallback for Github telemetry:', err);
      }
    };

    const fetchLeetcodeData = async () => {
      try {
        const [profileRes, solvedRes, contestRes] = await Promise.all([
          fetch('https://alfa-leetcode-api.onrender.com/lakshyakumarsingh1'),
          fetch('https://alfa-leetcode-api.onrender.com/lakshyakumarsingh1/solved'),
          fetch('https://alfa-leetcode-api.onrender.com/lakshyakumarsingh1/contest')
        ]);

        let profileData = {};
        if (profileRes.ok) profileData = await profileRes.json();
        let solvedData = {};
        if (solvedRes.ok) solvedData = await solvedRes.json();
        let contestData = {};
        if (contestRes.ok) contestData = await contestRes.json();

        if (active) {
          setLeetcodeData(prev => ({
            solved: (solvedData as any).solvedProblem || prev.solved,
            easySolved: (solvedData as any).easySolved || prev.easySolved,
            mediumSolved: (solvedData as any).mediumSolved || prev.mediumSolved,
            hardSolved: (solvedData as any).hardSolved || prev.hardSolved,
            ranking: (profileData as any).ranking || prev.ranking,
            contestRating: (contestData as any).contestRating || prev.contestRating,
            contestAttend: (contestData as any).contestAttend || prev.contestAttend,
            contestTopPercentage: (contestData as any).contestTopPercentage || prev.contestTopPercentage,
            contestGlobalRanking: (contestData as any).contestGlobalRanking || prev.contestGlobalRanking,
          }));
        }
      } catch (err) {
        console.warn('Using offline fallback for LeetCode telemetry:', err);
      }
    };

    fetchGithubData();
    fetchLeetcodeData();
    return () => { active = false; };
  }, []);

  return (
    <div className="w-full h-full bg-[#c0c0c0] font-pixel text-black p-4 select-none overflow-y-auto leading-tight">
      <div className="flex flex-col gap-4">
        
        {/* Top Section: Developer Profile Bio (Screen 7 Style) */}
        <div className="flex gap-4 p-3 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white">
          {/* Avatar Picture Box */}
          <div className="shrink-0 flex items-center justify-center p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-md w-24 h-24">
            <svg className="w-full h-full bg-white border-2 border-t-black border-l-black border-b-white border-r-white" viewBox="0 0 80 80">
              {/* Pixelated Head */}
              <rect x="24" y="20" width="32" height="32" fill="#c0c0c0" />
              <rect x="28" y="24" width="24" height="24" fill="#a0a0a0" />
              {/* Eyes */}
              <rect x="32" y="30" width="4" height="4" fill="#000" />
              <rect x="44" y="30" width="4" height="4" fill="#000" />
              {/* Smile */}
              <rect x="34" y="40" width="12" height="2" fill="#000" />
              <rect x="34" y="38" width="2" height="2" fill="#000" />
              <rect x="44" y="38" width="2" height="2" fill="#000" />
              {/* Body */}
              <rect x="16" y="52" width="48" height="24" fill="#000080" />
            </svg>
          </div>

          {/* Biography details */}
          <div className="flex flex-col justify-between py-1 select-text">
            <div>
              <h2 className="text-xl font-bold text-[#000080] tracking-wider uppercase leading-none">
                Developer Profile
              </h2>
              <p className="text-sm text-[#808080] font-mono mt-1 leading-none">
                LAKSHYA // AI Engineer & Full-Stack Developer
              </p>
            </div>
            <p className="text-sm text-black leading-snug mt-2 max-w-lg font-bold">
              {resumeData.summary}
            </p>
          </div>
        </div>

        {/* Middle Section: EDUCATION & EXPERIENCE (2-column grids) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Education list */}
          <div className="bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3">
            <h3 className="text-sm font-bold bg-[#000080] text-white px-2 py-0.5 border border-t-white border-l-white border-b-black border-r-black mb-3 select-none uppercase tracking-wide">
              EDUCATION (VIT Chennai)
            </h3>
            
            <div className="flex flex-col gap-3 font-bold select-text">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="border-b border-[#dfdfdf] pb-2 last:border-b-0">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#000080] text-base">{edu.degree}</span>
                    <span className="text-xs text-[#808080] font-mono">{edu.period}</span>
                  </div>
                  <div className="text-sm mt-1 text-[#404040]">{edu.institution}</div>
                  {edu.grade && (
                    <div className="text-sm text-[#008000] font-bold font-mono mt-0.5">{edu.grade}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Experience list */}
          <div className="bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3">
            <h3 className="text-sm font-bold bg-[#808080] text-white px-2 py-0.5 border border-t-white border-l-white border-b-black border-r-black mb-3 select-none uppercase tracking-wide">
              EXPERIENCE (GDSC & Freelance)
            </h3>
            
            <div className="flex flex-col gap-3 font-bold select-text">
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="border-b border-[#dfdfdf] pb-2 last:border-b-0">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#000080] text-base">{exp.role}</span>
                    <span className="text-xs text-[#808080] font-mono">{exp.period}</span>
                  </div>
                  <div className="text-sm mt-1 text-[#404040]">{exp.company}</div>
                  <ul className="list-disc pl-4 text-xs text-[#505050] font-sans leading-relaxed mt-1">
                    {exp.points.slice(0, 2).map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Section: GITHUB TELEMETRY PANELS (Screen 7 Style, now pulls live data) */}
        <div className="bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 flex flex-col gap-3">
          <h3 className="text-sm font-bold bg-[#000080] text-white px-2 py-0.5 border border-t-white border-l-white border-b-black border-r-black select-none uppercase tracking-wider">
            GITHUB ANALYTICS & TELEMETRY
          </h3>

          {/* Row 1: Stats & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: X-ImLucky-X's GitHub Stats */}
            <div className="bg-[#c0c0c0] border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 flex justify-between relative min-h-[160px]">
              <div className="flex flex-col gap-2 font-bold select-text text-sm">
                <span className="text-[#000080] text-base border-b border-black/10 pb-0.5 uppercase tracking-wide">
                  X-ImLucky-X's Stats
                </span>
                <div className="flex flex-col gap-1 mt-1 text-[13px]">
                  <div className="flex justify-between w-[200px]">
                    <span className="text-[#404040]">Total Stars Earned:</span>
                    <span>{githubData.stars}</span>
                  </div>
                  <div className="flex justify-between w-[200px]">
                    <span className="text-[#404040]">Total Commits:</span>
                    <span>{githubData.commits}</span>
                  </div>
                  <div className="flex justify-between w-[200px]">
                    <span className="text-[#404040]">Total PRs:</span>
                    <span>{githubData.prs}</span>
                  </div>
                  <div className="flex justify-between w-[200px]">
                    <span className="text-[#404040]">Total Issues:</span>
                    <span>{githubData.issues}</span>
                  </div>
                  <div className="flex justify-between w-[200px]">
                    <span className="text-[#404040]">Public Repositories:</span>
                    <span>{githubData.publicRepos}</span>
                  </div>
                </div>
              </div>
              
              {/* Rank Circle Badge */}
              <div className="flex flex-col items-center justify-center pr-4 select-none">
                <div className="w-18 h-18 rounded-full border-4 border-[#000080] flex items-center justify-center bg-white shadow-inner">
                  <span className="text-3xl font-black text-[#000080]">{githubData.rank}</span>
                </div>
                <span className="text-[10px] text-[#505050] mt-1 font-bold">SYSTEM RANK</span>
              </div>
            </div>

            {/* Box 2: Most Used Languages */}
            <div className="bg-[#c0c0c0] border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 flex flex-col justify-between min-h-[160px]">
              <div className="font-bold select-text text-sm flex flex-col gap-2">
                <span className="text-[#000080] text-base border-b border-black/10 pb-0.5 uppercase tracking-wide">
                  Most Used Languages
                </span>
                
                {/* Horizontal Segmented Bar Chart */}
                <div className="w-full h-5 border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white bg-gray-300 flex overflow-hidden mt-1 select-none">
                  {githubData.languages.map((lang) => (
                    <div 
                      key={lang.name}
                      style={{ 
                        width: `${lang.percentage}%`,
                        backgroundColor: lang.color
                      }}
                      title={`${lang.name}: ${lang.percentage.toFixed(2)}%`}
                    />
                  ))}
                </div>

                {/* Languages Legend Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[12px] font-bold">
                  {githubData.languages.slice(0, 6).map((lang) => (
                    <div key={lang.name} className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 inline-block border border-black/30 shrink-0" style={{ backgroundColor: lang.color }} />
                      <span className="truncate">{lang.name}</span>
                      <span className="text-[#606060] font-mono text-[11px] ml-auto shrink-0">{lang.percentage.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Streaks & Contribution Count */}
          <div className="bg-[#c0c0c0] border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 font-bold text-sm">
            <div className="grid grid-cols-3 divide-x-2 divide-gray-400 text-center select-text">
              <div className="flex flex-col justify-center py-1">
                <span className="text-2xl font-black text-[#000080]">{githubData.contributions}</span>
                <span className="text-[10px] text-[#505050] uppercase mt-1">Total Contributions</span>
                <span className="text-[9px] text-[#808080] font-mono leading-none">(Jun 12, 2023 - Present)</span>
              </div>
              
              <div className="flex flex-col items-center justify-center py-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black text-[#000080]">{githubData.currentStreak}</span>
                  <span className="text-orange-600 animate-pulse text-base">🔥</span>
                </div>
                <span className="text-[10px] text-[#505050] uppercase mt-1">Current Streak</span>
                <span className="text-[9px] text-[#808080] font-mono leading-none">(Active streak)</span>
              </div>

              <div className="flex flex-col justify-center py-1">
                <span className="text-2xl font-black text-[#000080]">{githubData.longestStreak}</span>
                <span className="text-[10px] text-[#505050] uppercase mt-1">Longest Streak</span>
                <span className="text-[9px] text-[#808080] font-mono leading-none">(May 23 - May 30)</span>
              </div>
            </div>
          </div>

          {/* Row 3: Contribution Line Graph */}
          <div className="bg-[#c0c0c0] border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 font-bold text-sm">
            <span className="text-[#000080] text-base border-b border-black/10 pb-0.5 mb-3 block uppercase tracking-wide text-center">
              X-ImLucky-X's Contribution Graph (Last 30 Days commit volume)
            </span>

            {/* Custom SVG Line Graph */}
            <div className="w-full bg-[#050508] border border-[#808080] p-4 flex items-center justify-center">
              <svg className="w-full h-48 md:h-56 max-w-3xl" viewBox="0 0 700 200">
                {/* Grid line helper backgrounds */}
                {[0, 25, 50, 75, 100].map((percent) => {
                  const yVal = 20 + (percent / 100) * 150;
                  const labelValue = Math.round((1 - percent / 100) * 12);
                  return (
                    <g key={percent} opacity="0.2">
                      <line x1="40" y1={yVal} x2="680" y2={yVal} stroke="#00ff00" strokeWidth="0.75" strokeDasharray="3 3" />
                      <text x="32" y={yVal + 3} fill="#00ff00" fontSize="11" textAnchor="end" className="font-pixel">{labelValue}</text>
                    </g>
                  );
                })}

                {/* Graph Lines & Area */}
                {(() => {
                  const data = githubData.activity;
                  const paddingLeft = 40;
                  const paddingRight = 20;
                  const chartWidth = 700 - paddingLeft - paddingRight;
                  const chartHeight = 150;
                  const spacing = chartWidth / (data.length - 1);
                  const maxVal = 12;

                  const coords = data.map((d, idx) => {
                    const x = paddingLeft + idx * spacing;
                    const y = 20 + chartHeight - (d.count / maxVal) * chartHeight;
                    return { x, y, ...d };
                  });

                  const linePath = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                  const areaPath = `${linePath} L ${coords[coords.length - 1].x} 170 L ${coords[0].x} 170 Z`;

                  return (
                    <>
                      <path d={areaPath} fill="rgba(0, 255, 0, 0.08)" />
                      <path d={linePath} stroke="#00ff00" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {coords.map((c, idx) => {
                        const showLabel = idx % 2 === 0;
                        return (
                          <g key={idx}>
                            <circle 
                              cx={c.x} 
                              cy={c.y} 
                              r="3.5" 
                              fill="#ffffff" 
                              stroke="#00ff00" 
                              strokeWidth="1.5" 
                            />
                            {c.count > 0 && (
                              <text x={c.x} y={c.y - 8} fill="#ffffff" fontSize="11" textAnchor="middle" className="font-pixel font-bold">
                                {c.count}
                              </text>
                            )}
                            {showLabel && (
                              <text x={c.x} y="190" fill="#00ff00" fontSize="10" textAnchor="middle" className="font-pixel select-none">
                                {c.day}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </>
                  );
                })()}

                {/* X and Y axes */}
                <line x1="40" y1="20" x2="40" y2="170" stroke="#008000" strokeWidth="1.5" />
                <line x1="40" y1="170" x2="680" y2="170" stroke="#008000" strokeWidth="1.5" />
              </svg>
            </div>
            
            {/* Live Contributions Grid Calendar in Win95 Panel Box */}
            <div className="mt-4 border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 bg-[#c0c0c0] flex flex-col gap-3">
              <h3 className="text-sm font-bold bg-[#808080] text-white px-2 py-0.5 border border-t-white border-l-white border-b-black border-r-black select-none uppercase tracking-wider">
                Live Contributions Matrix Calendar
              </h3>
              
              <div className="bg-black border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 flex items-center justify-center">
                <img 
                  src="https://ghchart.rshah.org/00ff00/X-ImLucky-X" 
                  alt="X-ImLucky-X's GitHub Contributions Calendar"
                  className="w-full max-w-2xl block object-contain select-none filter invert hue-rotate-180 brightness-110 contrast-125"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LeetCode Telemetry Section */}
        <div className="bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 flex flex-col gap-3">
          <h3 className="text-sm font-bold bg-[#000080] text-white px-2 py-0.5 border border-t-white border-l-white border-b-black border-r-black select-none uppercase tracking-wider">
            LEETCODE ANALYTICS & TELEMETRY
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Solved Problems Details */}
            <div className="bg-[#c0c0c0] border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 flex flex-col justify-between min-h-[160px]">
              <div className="flex flex-col gap-2 font-bold select-text text-sm w-full">
                <span className="text-[#000080] text-base border-b border-black/10 pb-0.5 uppercase tracking-wide flex justify-between">
                  <span>Problems Solved</span>
                  <span className="font-mono text-[#000080]">{leetcodeData.solved} Total</span>
                </span>
                
                <div className="flex flex-col gap-3 mt-2">
                  {/* Easy Solved */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#008000]">EASY</span>
                      <span>{leetcodeData.easySolved} Solved</span>
                    </div>
                    <div className="w-full h-4 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white flex overflow-hidden">
                      <div 
                        className="bg-[#00a82f] border-r border-[#006000]"
                        style={{ width: `${leetcodeData.solved > 0 ? (leetcodeData.easySolved / leetcodeData.solved) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Medium Solved */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#c08000]">MEDIUM</span>
                      <span>{leetcodeData.mediumSolved} Solved</span>
                    </div>
                    <div className="w-full h-4 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white flex overflow-hidden">
                      <div 
                        className="bg-[#ffb700] border-r border-[#b07b00]"
                        style={{ width: `${leetcodeData.solved > 0 ? (leetcodeData.mediumSolved / leetcodeData.solved) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Hard Solved */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#a80000]">HARD</span>
                      <span>{leetcodeData.hardSolved} Solved</span>
                    </div>
                    <div className="w-full h-4 bg-white border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white flex overflow-hidden">
                      <div 
                        className="bg-[#ff2d55] border-r border-[#a00020]"
                        style={{ width: `${leetcodeData.solved > 0 ? (leetcodeData.hardSolved / leetcodeData.solved) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Contest Rating & Knight Badge */}
            <div className="bg-[#c0c0c0] border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-3 flex justify-between items-stretch min-h-[160px]">
              <div className="flex flex-col gap-2 font-bold select-text text-sm">
                <span className="text-[#000080] text-base border-b border-black/10 pb-0.5 uppercase tracking-wide">
                  Contest Standings
                </span>
                <div className="flex flex-col gap-1 mt-1 text-[13px] font-mono">
                  <div className="flex justify-between w-[220px]">
                    <span className="text-[#404040]">Contest Rating:</span>
                    <span className="text-[#000080] font-bold">{leetcodeData.contestRating.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-[220px]">
                    <span className="text-[#404040]">Global Rank:</span>
                    <span>{leetcodeData.contestGlobalRanking.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between w-[220px]">
                    <span className="text-[#404040]">Top Percentile:</span>
                    <span className="text-[#008000] font-bold">Top {leetcodeData.contestTopPercentage.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between w-[220px]">
                    <span className="text-[#404040]">Contests Attended:</span>
                    <span>{leetcodeData.contestAttend}</span>
                  </div>
                  <div className="flex justify-between w-[220px]">
                    <span className="text-[#404040]">Global Profile Rank:</span>
                    <span>{leetcodeData.ranking.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Badge Panel */}
              <div className="flex flex-col items-center justify-center pr-2 select-none shrink-0 border-l-2 border-gray-400 pl-4">
                <div className="w-18 h-18 bg-[#800080] border-4 border-double border-white flex flex-col items-center justify-center shadow-lg p-1 text-white">
                  <span className="text-[9px] font-bold tracking-widest text-[#ffcc00] animate-pulse">KNIGHT</span>
                  <span className="text-xl font-black">1714</span>
                </div>
                <span className="text-[9px] text-[#505050] mt-2 font-bold uppercase tracking-wider text-center">LEETCODE TIER</span>
              </div>
            </div>
          </div>

          {/* Row 2: Profile link footer */}
          <div className="bg-[#c0c0c0] border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white p-2 font-bold text-xs flex justify-between items-center">
            <span className="text-[#404040]">LeetCode URL:</span>
            <a 
              href="https://leetcode.com/u/lakshyakumarsingh1/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[#000080] underline font-mono select-all hover:text-[#0000ff]"
            >
              https://leetcode.com/u/lakshyakumarsingh1/
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutApp;
