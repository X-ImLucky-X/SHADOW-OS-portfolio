import React, { useState, useEffect } from 'react';
import { useWindowStore } from '../store/windowStore';
import { useTelemetryStore } from '../store/telemetryStore';
import { 
  ArrowLeft, 
  ArrowRight, 
  X, 
  RotateCw, 
  Home, 
  Globe, 
  FileText, 
  ExternalLink,
  Code,
  Folder,
  Star,
  GitBranch,
  AlertCircle
} from 'lucide-react';

export const BrowserApp: React.FC = () => {
  const { browserUrl, setBrowserUrl } = useWindowStore();
  const { projects } = useTelemetryStore();
  const [inputUrl, setInputUrl] = useState(browserUrl);
  
  // Browser History
  const [history, setHistory] = useState<string[]>([browserUrl]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Retro GitHub Repository Viewer States
  const [isGithubRepo, setIsGithubRepo] = useState(false);
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'readme'>('overview');
  const [loadingRepo, setLoadingRepo] = useState(false);

  // Retro GitHub Profile Viewer States
  const [isGithubProfile, setIsGithubProfile] = useState(false);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [profileRepos, setProfileRepos] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Sync external changes to browserUrl into history
  useEffect(() => {
    setInputUrl(browserUrl);
    
    const cleanUrl = browserUrl.replace(/\/$/, ''); // Remove trailing slash
    const matchRepo = cleanUrl.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/i);
    const matchProfile = cleanUrl.match(/github\.com\/([a-zA-Z0-9_.-]+)$/i);

    if (matchRepo) {
      setIsGithubRepo(true);
      setIsGithubProfile(false);
      const owner = matchRepo[1];
      const repo = matchRepo[2];
      fetchRepoDetails(owner, repo);
    } else if (matchProfile && matchProfile[1].toLowerCase() !== 'www') {
      setIsGithubRepo(false);
      setIsGithubProfile(true);
      const username = matchProfile[1];
      fetchProfileDetails(username);
    } else {
      setIsGithubRepo(false);
      setIsGithubProfile(false);
      setRepoInfo(null);
      setReadmeContent('');
      setProfileInfo(null);
      setProfileRepos([]);
    }

    if (history[historyIdx] !== browserUrl) {
      const newHistory = history.slice(0, historyIdx + 1);
      setHistory([...newHistory, browserUrl]);
      setHistoryIdx(newHistory.length);
    }
  }, [browserUrl]);

  const fetchRepoDetails = (owner: string, repo: string) => {
    setLoadingRepo(true);
    const localProj = projects.find(p => p.github.toLowerCase().includes(`${owner}/${repo}`.toLowerCase()));
    
    Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`).then(r => r.ok ? r.json() : null),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: { Accept: 'application/vnd.github.v3.raw' }
      }).then(r => r.ok ? r.text() : '')
    ]).then(([repoData, readmeText]) => {
      if (repoData) {
        setRepoInfo({
          title: repoData.name,
          description: repoData.description || (localProj ? localProj.shortDesc : 'No description available.'),
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          language: repoData.language,
          openIssues: repoData.open_issues_count,
          owner: repoData.owner.login,
          htmlUrl: repoData.html_url,
          liveUrl: localProj?.live || repoData.homepage || null
        });
      } else if (localProj) {
        setRepoInfo({
          title: localProj.title,
          description: localProj.shortDesc,
          stars: localProj.stars || 0,
          forks: 0,
          language: localProj.tech[0],
          openIssues: 0,
          owner: owner,
          htmlUrl: localProj.github,
          liveUrl: localProj.live
        });
      } else {
        setRepoInfo({
          title: repo,
          description: 'Failed to retrieve description.',
          stars: 0,
          forks: 0,
          language: 'Unknown',
          openIssues: 0,
          owner: owner,
          htmlUrl: `https://github.com/${owner}/${repo}`,
          liveUrl: null
        });
      }
      setReadmeContent(readmeText || 'No README.md content found.');
    }).catch(err => {
      console.error(err);
      if (localProj) {
        setRepoInfo({
          title: localProj.title,
          description: localProj.shortDesc,
          stars: localProj.stars || 0,
          forks: 0,
          language: localProj.tech[0],
          owner: owner,
          htmlUrl: localProj.github,
          liveUrl: localProj.live
        });
      }
    }).finally(() => {
      setLoadingRepo(false);
    });
  };

  const fetchProfileDetails = (username: string) => {
    setLoadingProfile(true);
    Promise.all([
      fetch(`https://api.github.com/users/${username}`).then(r => r.ok ? r.json() : null),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`).then(r => r.ok ? r.json() : [])
    ]).then(([userData, reposData]) => {
      if (userData) {
        setProfileInfo({
          login: userData.login,
          name: userData.name || userData.login,
          avatarUrl: userData.avatar_url,
          bio: userData.bio || 'No bio available.',
          location: userData.location || 'Unknown',
          company: userData.company || 'None',
          publicRepos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
          htmlUrl: userData.html_url
        });
      }
      if (Array.isArray(reposData)) {
        setProfileRepos(reposData.filter((r: any) => !r.fork));
      }
    }).catch(err => {
      console.error('Failed to fetch profile details:', err);
    }).finally(() => {
      setLoadingProfile(false);
    });
  };

  const handleNavigate = (url: string) => {
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    setBrowserUrl(targetUrl);
  };

  const handleBack = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      setBrowserUrl(history[prevIdx]);
    }
  };

  const handleForward = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setBrowserUrl(history[nextIdx]);
    }
  };

  const handleHome = () => {
    setBrowserUrl('https://github.com/X-ImLucky-X');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#c0c0c0] font-sans text-black select-none border border-white">
      {/* 1. Menu Bar */}
      <div className="flex gap-4 px-2 py-0.5 border-b border-[#808080] text-xs">
        <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">File</span>
        <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Edit</span>
        <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">View</span>
        <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Go</span>
        <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Favorites</span>
        <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Help</span>
      </div>

      {/* 2. Navigation Toolbar */}
      <div className="flex items-center gap-1 p-1 border-b border-[#808080] bg-[#c0c0c0] shrink-0">
        <button 
          onClick={handleBack}
          disabled={historyIdx === 0}
          className="flex flex-col items-center p-1 border border-transparent disabled:opacity-40 hover:border-t-white hover:border-l-white hover:border-b-black hover:border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white outline-none cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[9px] font-bold">Back</span>
        </button>
        <button 
          onClick={handleForward}
          disabled={historyIdx === history.length - 1}
          className="flex flex-col items-center p-1 border border-transparent disabled:opacity-40 hover:border-t-white hover:border-l-white hover:border-b-black hover:border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white outline-none cursor-pointer"
        >
          <ArrowRight className="w-5 h-5" />
          <span className="text-[9px] font-bold">Forward</span>
        </button>
        <button 
          onClick={() => handleNavigate(browserUrl)}
          className="flex flex-col items-center p-1 border border-transparent hover:border-t-white hover:border-l-white hover:border-b-black hover:border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white outline-none cursor-pointer"
        >
          <X className="w-5 h-5 text-red-700" />
          <span className="text-[9px] font-bold">Stop</span>
        </button>
        <button 
          onClick={() => handleNavigate(browserUrl)}
          className="flex flex-col items-center p-1 border border-transparent hover:border-t-white hover:border-l-white hover:border-b-black hover:border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white outline-none cursor-pointer"
        >
          <RotateCw className="w-5 h-5 text-green-700" />
          <span className="text-[9px] font-bold">Refresh</span>
        </button>
        <button 
          onClick={handleHome}
          className="flex flex-col items-center p-1 border border-transparent hover:border-t-white hover:border-l-white hover:border-b-black hover:border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white outline-none cursor-pointer"
        >
          <Home className="w-5 h-5 text-[#000080]" />
          <span className="text-[9px] font-bold">Home</span>
        </button>
        <div className="h-8 w-[1px] bg-[#808080] mx-1" />
        <div className="flex items-center gap-1.5 flex-1 pl-1">
          <span className="text-xs font-bold font-mono">Address:</span>
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate(inputUrl)}
            className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-1 text-xs outline-none font-mono text-black shadow-inner"
          />
          <button 
            onClick={() => handleNavigate(inputUrl)}
            className="px-3 py-1 bg-[#c0c0c0] font-bold border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs cursor-pointer"
          >
            Go
          </button>
        </div>
      </div>

      {/* 3. Browser Viewport Area */}
      <div className="flex-1 w-full bg-[#3a6ea5] p-3 overflow-hidden flex flex-col relative">
        {isGithubRepo ? (
          /* Retro GitHub Repository Viewer */
          <div className="flex-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black p-1 flex flex-col overflow-hidden shadow-2xl">
            {/* Repo Header */}
            <div className="bg-[#000080] text-white p-2 flex justify-between items-center select-none font-pixel uppercase tracking-wide">
              <div className="flex items-center gap-2">
                <span>📂</span>
                <span className="text-sm font-bold truncate">
                  {repoInfo ? `${repoInfo.owner}/${repoInfo.title}` : 'Loading Repository...'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-black">
                {repoInfo?.liveUrl && (
                  <a 
                    href={repoInfo.liveUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black hover:bg-[#dfdfdf]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                  </a>
                )}
                <a 
                  href={browserUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black hover:bg-[#dfdfdf]"
                >
                  <Globe className="w-3.5 h-3.5" /> View On GitHub
                </a>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-0.5 border-b border-[#808080] bg-[#d9d9d9] pt-1 px-1 shrink-0">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 text-xs font-bold border-t border-l border-r border-[#808080] rounded-t-sm outline-none cursor-pointer ${
                  activeTab === 'overview' 
                    ? 'bg-[#c0c0c0] border-b-[#c0c0c0] translate-y-[1px] z-10' 
                    : 'bg-[#b0b0b0] border-b-[#808080]'
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('readme')}
                className={`px-3 py-1 text-xs font-bold border-t border-l border-r border-[#808080] rounded-t-sm outline-none cursor-pointer ${
                  activeTab === 'readme' 
                    ? 'bg-[#c0c0c0] border-b-[#c0c0c0] translate-y-[1px] z-10' 
                    : 'bg-[#b0b0b0] border-b-[#808080]'
                }`}
              >
                README.md
              </button>
            </div>

            {/* Tab Content viewport */}
            <div className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white p-3 overflow-y-auto">
              {loadingRepo ? (
                <div className="w-full h-full flex flex-col items-center justify-center font-pixel text-black gap-2">
                  <div className="w-8 h-8 border-4 border-t-[#000080] border-[#808080] rounded-full animate-spin" />
                  <span>Fetching repository metadata nodes...</span>
                </div>
              ) : activeTab === 'overview' ? (
                <div className="flex flex-col gap-4 text-black font-sans leading-relaxed">
                  <div>
                    <h2 className="text-xl font-bold border-b-2 border-double border-black/10 pb-1 flex items-center gap-2">
                      <span>📁</span> {repoInfo?.title}
                    </h2>
                    <p className="mt-2 text-sm italic text-[#404040]">
                      {repoInfo?.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#f0f0f0] border border-[#808080] p-3 text-xs font-bold">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                      <span>Stars: {repoInfo?.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4 text-purple-700" />
                      <span>Forks: {repoInfo?.forks}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Code className="w-4 h-4 text-blue-700" />
                      <span>Language: {repoInfo?.language}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>Issues: {repoInfo?.openIssues}</span>
                    </div>
                  </div>

                  {/* Simulated Directories list */}
                  <div>
                    <h3 className="text-xs font-bold bg-[#808080] text-white px-2 py-0.5 mb-2 w-max border border-t-white border-l-white border-b-black border-r-black">
                      Simulated File Tree
                    </h3>
                    <div className="flex flex-col border border-[#808080] bg-white divide-y divide-gray-100 text-xs">
                      <div className="flex items-center gap-2 p-1.5 font-bold text-blue-900 bg-[#f9f9f9]">
                        <Folder className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        <span>src/</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 font-bold text-blue-900 bg-[#f9f9f9]">
                        <Folder className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        <span>public/</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 font-bold text-blue-900 bg-[#f9f9f9]">
                        <Folder className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        <span>assets/</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 text-black">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>package.json</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 text-black">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>README.md</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* README Tab */
                <div className="w-full h-full bg-[#050508] border border-[#808080] p-4 text-[#00ff00] font-mono text-xs whitespace-pre-wrap overflow-y-auto leading-relaxed select-text selection:bg-[#00ff00] selection:text-black">
                  {readmeContent}
                </div>
              )}
            </div>
          </div>
        ) : isGithubProfile ? (
          /* Retro GitHub Profile Viewer */
          <div className="flex-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black p-1 flex flex-col overflow-hidden shadow-2xl">
            {/* Profile Header */}
            <div className="bg-[#000080] text-white p-2 flex justify-between items-center select-none font-pixel uppercase tracking-wide">
              <div className="flex items-center gap-2">
                <span>👤</span>
                <span className="text-sm font-bold truncate">
                  {profileInfo ? `${profileInfo.name}'s Profile` : 'Loading Profile...'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-black">
                <a 
                  href={browserUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black hover:bg-[#dfdfdf]"
                >
                  <Globe className="w-3.5 h-3.5" /> View On GitHub
                </a>
              </div>
            </div>

            {/* Profile Viewport */}
            <div className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white p-3 overflow-y-auto flex flex-col gap-4 text-black">
              {loadingProfile ? (
                <div className="w-full h-full flex flex-col items-center justify-center font-pixel text-black gap-2">
                  <div className="w-8 h-8 border-4 border-t-[#000080] border-[#808080] rounded-full animate-spin" />
                  <span>Fetching profile nodes...</span>
                </div>
              ) : (
                <>
                  {/* Top user summary details */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start border-b border-[#808080] pb-4">
                    {profileInfo?.avatarUrl && (
                      <img 
                        src={profileInfo.avatarUrl} 
                        alt="Avatar" 
                        className="w-20 h-20 border-2 border-[#808080] rounded-none shadow-md"
                      />
                    )}
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-xl font-bold font-pixel text-[#000080]">{profileInfo?.name}</h2>
                      <p className="text-xs font-mono text-[#505050]">@{profileInfo?.login}</p>
                      <p className="text-xs font-bold mt-1 text-[#333] italic">{profileInfo?.bio}</p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 justify-center sm:justify-start text-[11px] font-bold text-gray-600">
                        {profileInfo?.location && <span>📍 {profileInfo.location}</span>}
                        {profileInfo?.company && profileInfo.company !== 'None' && <span>💼 {profileInfo.company}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Grid Stats */}
                  <div className="grid grid-cols-3 gap-2 bg-[#f0f0f0] border border-[#808080] p-2 text-center text-xs font-bold">
                    <div className="border-r border-gray-300">
                      <div className="text-[#000080] text-lg font-pixel">{profileInfo?.publicRepos || 0}</div>
                      <div className="text-[10px] text-gray-600">REPOSITORIES</div>
                    </div>
                    <div className="border-r border-gray-300">
                      <div className="text-[#000080] text-lg font-pixel">{profileInfo?.followers || 0}</div>
                      <div className="text-[10px] text-gray-600">FOLLOWERS</div>
                    </div>
                    <div>
                      <div className="text-[#000080] text-lg font-pixel">{profileInfo?.following || 0}</div>
                      <div className="text-[10px] text-gray-600">FOLLOWING</div>
                    </div>
                  </div>

                  {/* Repos list */}
                  <div>
                    <h3 className="text-xs font-bold bg-[#808080] text-white px-2 py-0.5 mb-2 w-max border border-t-white border-l-white border-b-black border-r-black">
                      Public Repositories
                    </h3>
                    <div className="flex flex-col border border-[#808080] bg-white divide-y divide-gray-200 text-xs">
                      {profileRepos.map((repo: any) => (
                        <div 
                          key={repo.id}
                          onClick={() => handleNavigate(repo.html_url)}
                          className="p-2.5 hover:bg-[#f0f0f0] cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div className="flex flex-col gap-1 pr-4 min-w-0">
                            <span className="font-bold text-blue-900 flex items-center gap-1 truncate">
                              <span>📁</span> {repo.name}
                            </span>
                            <span className="text-[10px] text-gray-600 truncate">{repo.description || 'No description provided.'}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-[10px] font-bold text-gray-500">
                            {repo.language && (
                              <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded-sm">
                                {repo.language}
                              </span>
                            )}
                            <span className="flex items-center gap-0.5">
                              ⭐ {repo.stargazers_count}
                            </span>
                          </div>
                        </div>
                      ))}
                      {profileRepos.length === 0 && (
                        <div className="p-4 text-center text-gray-500 italic">No repositories found.</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Normal web URL Viewport using iframe */
          <div className="flex-1 w-full flex flex-col bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white relative">
            <iframe 
              src={browserUrl} 
              title="Browser Viewport" 
              className="w-full flex-1 border-none"
            />
            {/* CORS/CSP Overlap warning overlay */}
            <div className="bg-[#ffffd0] border-t border-[#808080] p-2 flex justify-between items-center text-xs shrink-0 select-none">
              <span className="flex items-center gap-1.5 text-yellow-900 font-bold">
                <AlertCircle className="w-4 h-4 text-yellow-700" />
                Due to security restrictions, some sites may not load inside frames.
              </span>
              <a 
                href={browserUrl} 
                target="_blank" 
                rel="noreferrer"
                className="px-2 py-0.5 bg-[#c0c0c0] font-bold border border-t-white border-l-white border-b-black border-r-black hover:bg-[#dfdfdf] text-black shrink-0 text-[10px] uppercase flex items-center gap-1"
              >
                Open in tab <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 4. Status Bar */}
      <div className="flex justify-between items-center bg-[#c0c0c0] px-2 py-1 text-xs border-t border-[#808080]">
        <span className="flex items-center gap-1 font-bold text-gray-700">
          <Globe className="w-3.5 h-3.5" />
          Status: Ready
        </span>
        <span className="font-bold border-l border-[#808080] pl-2 text-gray-700">
          Zone: Local Intranet
        </span>
      </div>
    </div>
  );
};

export default BrowserApp;
