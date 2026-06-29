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
  AlertCircle,
  Eye
} from 'lucide-react';

export const BrowserApp: React.FC = () => {
  const { browserUrl, setBrowserUrl } = useWindowStore();
  const { projects } = useTelemetryStore();
  const [inputUrl, setInputUrl] = useState(browserUrl);
  
  // Browser History
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // View Mode: 'live' (real proxy browser) or 'retro' (our offline custom interface for GitHub)
  const [viewMode, setViewMode] = useState<'live' | 'retro'>('live');

  // Proxy States
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [useWebProxy, setUseWebProxy] = useState(false);

  // Retro GitHub Viewer States
  const [isGithubUrl, setIsGithubUrl] = useState(false);
  const [isGithubRepo, setIsGithubRepo] = useState(false);
  const [isGithubProfile, setIsGithubProfile] = useState(false);
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'readme'>('overview');
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [profileRepos, setProfileRepos] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Navigation controller
  const handleNavigate = (url: string) => {
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    setBrowserUrl(targetUrl);
  };

  // Sync external changes to browserUrl into history
  useEffect(() => {
    setInputUrl(browserUrl);
    
    // Determine if URL is GitHub-related
    const cleanUrl = browserUrl.replace(/\/$/, '');
    const matchRepo = cleanUrl.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/i);
    const matchProfile = cleanUrl.match(/github\.com\/([a-zA-Z0-9_.-]+)$/i);

    if (matchRepo) {
      setIsGithubUrl(true);
      setIsGithubRepo(true);
      setIsGithubProfile(false);
      const owner = matchRepo[1];
      const repo = matchRepo[2];
      fetchRepoDetails(owner, repo);
    } else if (matchProfile && matchProfile[1].toLowerCase() !== 'www') {
      setIsGithubUrl(true);
      setIsGithubRepo(false);
      setIsGithubProfile(true);
      const username = matchProfile[1];
      fetchProfileDetails(username);
    } else {
      setIsGithubUrl(false);
      setIsGithubRepo(false);
      setIsGithubProfile(false);
    }

    // Update history stack
    if (historyIdx === -1 || history[historyIdx] !== browserUrl) {
      const newHistory = history.slice(0, historyIdx + 1);
      const updatedHistory = [...newHistory, browserUrl];
      setHistory(updatedHistory);
      setHistoryIdx(updatedHistory.length - 1);
    }

    // Load actual website via CORS/HTML proxy if live view is selected
    if (viewMode === 'live') {
      loadLivePage(browserUrl);
    }
  }, [browserUrl]);

  // Handle switching view mode
  useEffect(() => {
    if (viewMode === 'live') {
      loadLivePage(browserUrl);
    }
  }, [viewMode]);

  // Fetch HTML content from target URL via allorigins proxy
  const loadLivePage = (url: string) => {
    setLoadingHtml(true);
    setErrorMsg(null);
    setHtmlContent('');
    setUseWebProxy(false);

    // If Google, use the frame-friendly Google page directly
    if (url.includes('google.com')) {
      const queryMatch = url.match(/q=([^&]+)/);
      const query = queryMatch ? queryMatch[1] : '';
      setHtmlContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Search</title>
          <style>
            html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; }
          </style>
        </head>
        <body>
          <iframe src="https://www.google.com/search?igu=1${query ? '&q=' + query : ''}"></iframe>
        </body>
        </html>
      `);
      setLoadingHtml(false);
      return;
    }

    // Fetch via raw CORS proxy
    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        return res.text();
      })
      .then(htmlText => {
        const rewritten = rewriteHtml(htmlText, url);
        setHtmlContent(rewritten);
      })
      .catch(err => {
        console.error('Proxy load error:', err);
        setErrorMsg('WebNavigator failed to open the target website. Click "Open in tab" or switch to the unblocked web proxy.');
      })
      .finally(() => {
        setLoadingHtml(false);
      });
  };

  // Rewrite absolute links/assets in HTML code
  const rewriteHtml = (html: string, baseUrl: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      let baseHref = baseUrl;
      const baseEl = doc.querySelector('base');
      if (baseEl && baseEl.getAttribute('href')) {
        baseHref = new URL(baseEl.getAttribute('href')!, baseUrl).href;
      }

      // Helper to rewrite relative paths to absolute URLs
      const rewriteAttr = (selector: string, attr: string) => {
        doc.querySelectorAll(selector).forEach(el => {
          const val = el.getAttribute(attr);
          if (val && !val.startsWith('data:') && !val.startsWith('blob:') && !val.startsWith('javascript:')) {
            try {
              const absoluteUrl = new URL(val, baseHref).href;
              el.setAttribute(attr, absoluteUrl);
            } catch (e) {}
          }
        });
      };

      rewriteAttr('a', 'href');
      rewriteAttr('link', 'href');
      rewriteAttr('img', 'src');
      rewriteAttr('script', 'src');
      rewriteAttr('iframe', 'src');
      rewriteAttr('form', 'action');
      rewriteAttr('source', 'src');
      rewriteAttr('source', 'srcset');

      // Strip Content-Security-Policy tags
      doc.querySelectorAll('meta[http-equiv="Content-Security-Policy"]').forEach(el => el.remove());
      doc.querySelectorAll('meta[http-equiv="content-security-policy"]').forEach(el => el.remove());

      // Handle meta refresh redirects
      const refreshMeta = doc.querySelector('meta[http-equiv="refresh"]');
      if (refreshMeta) {
        const content = refreshMeta.getAttribute('content');
        if (content) {
          const match = content.match(/url=(.+)$/i);
          if (match) {
            const redirectUrl = new URL(match[1].trim(), baseHref).href;
            setTimeout(() => handleNavigate(redirectUrl), 1000);
          }
        }
      }

      return doc.documentElement.outerHTML;
    } catch (e) {
      console.error('HTML rewrite error:', e);
      return html;
    }
  };

  // Intercept events inside iframe (link clicks, form GETs)
  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.currentTarget;
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Intercept link clicks
      iframeDoc.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a');
        if (link && link.href) {
          event.preventDefault();
          handleNavigate(link.href);
        }
      }, true);

      // Intercept form submissions
      iframeDoc.addEventListener('submit', (event: SubmitEvent) => {
        const form = event.target as HTMLFormElement;
        const method = form.method.toLowerCase();
        const action = form.action;
        
        if (method === 'get') {
          event.preventDefault();
          const formData = new FormData(form);
          const params = new URLSearchParams();
          formData.forEach((value, key) => {
            params.append(key, value.toString());
          });
          const targetUrl = action + (action.includes('?') ? '&' : '?') + params.toString();
          handleNavigate(targetUrl);
        }
      }, true);

    } catch (err) {
      console.warn('Sandbox or cross-origin blocked iframe click interception.', err);
    }
  };

  // Fetch functions for Retro offline layouts
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
      } else {
        // Fallback profile mock for rate-limiting
        setProfileInfo({
          login: username,
          name: username === 'X-ImLucky-X' ? 'Lakshya Kumar Singh' : username,
          avatarUrl: username === 'X-ImLucky-X' ? 'https://avatars.githubusercontent.com/u/136382281?v=4' : '',
          bio: username === 'X-ImLucky-X' ? 'Passionate Developer & Open Source Contributor' : 'GitHub user profile.',
          location: 'India',
          company: 'None',
          publicRepos: username === 'X-ImLucky-X' ? projects.length : 0,
          followers: 12,
          following: 8,
          htmlUrl: `https://github.com/${username}`
        });
      }

      if (Array.isArray(reposData) && reposData.length > 0) {
        setProfileRepos(reposData.filter((r: any) => !r.fork));
      } else {
        // Fallback to local store projects list for rate limiting
        if (username.toLowerCase() === 'x-imlucky-x') {
          const mappedRepos = projects.map(p => ({
            id: p.id,
            name: p.title,
            description: p.shortDesc,
            language: p.tech[0],
            stargazers_count: p.stars || 0,
            html_url: p.github,
            fork: false
          }));
          setProfileRepos(mappedRepos);
        } else {
          setProfileRepos([]);
        }
      }
    }).catch(err => {
      console.error(err);
      if (username.toLowerCase() === 'x-imlucky-x') {
        setProfileInfo({
          login: username,
          name: 'Lakshya Kumar Singh',
          avatarUrl: 'https://avatars.githubusercontent.com/u/136382281?v=4',
          bio: 'Passionate Developer & Open Source Contributor',
          location: 'India',
          company: 'None',
          publicRepos: projects.length,
          followers: 12,
          following: 8,
          htmlUrl: `https://github.com/${username}`
        });
        const mappedRepos = projects.map(p => ({
          id: p.id,
          name: p.title,
          description: p.shortDesc,
          language: p.tech[0],
          stargazers_count: p.stars || 0,
          html_url: p.github,
          fork: false
        }));
        setProfileRepos(mappedRepos);
      }
    }).finally(() => {
      setLoadingProfile(false);
    });
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
      <div className="flex justify-between items-center px-2 py-0.5 border-b border-[#808080] text-xs">
        <div className="flex gap-4">
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">File</span>
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Edit</span>
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">View</span>
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Go</span>
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Favorites</span>
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Help</span>
        </div>
        
        {/* Toggle Mode button for GitHub links */}
        {isGithubUrl && (
          <button 
            onClick={() => setViewMode(viewMode === 'live' ? 'retro' : 'live')}
            className="px-2 py-0.5 bg-[#dfdfdf] border border-[#808080] font-pixel text-[10px] uppercase flex items-center gap-1 cursor-pointer outline-none hover:bg-gray-100"
          >
            {viewMode === 'live' ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {viewMode === 'live' ? 'Switch to Retro View' : 'Switch to Live View'}
          </button>
        )}
      </div>

      {/* 2. Navigation Toolbar */}
      <div className="flex items-center gap-1 p-1 border-b border-[#808080] bg-[#c0c0c0] shrink-0">
        <button 
          onClick={handleBack}
          disabled={historyIdx <= 0}
          className="flex flex-col items-center p-1 border border-transparent disabled:opacity-40 hover:border-t-white hover:border-l-white hover:border-b-black hover:border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white outline-none cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[9px] font-bold">Back</span>
        </button>
        <button 
          onClick={handleForward}
          disabled={historyIdx >= history.length - 1}
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
            className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-1 text-xs outline-none font-mono text-black shadow-inner select-text"
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
        
        {useWebProxy ? (
          /* Embed unblocked CroxyProxy inside the iframe if direct proxy failover occurs */
          <div className="flex-1 w-full flex flex-col bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white overflow-hidden relative">
            <iframe 
              src="https://www.croxyproxy.com/" 
              title="Unblocked Proxy Viewport" 
              className="w-full flex-1 border-none"
            />
            {/* Warning info bar */}
            <div className="bg-[#ffffd0] border-t border-[#808080] p-1.5 flex justify-between items-center text-xs shrink-0 select-none z-40">
              <span className="flex items-center gap-1.5 text-yellow-900 font-bold">
                <AlertCircle className="w-4 h-4 text-yellow-700" />
                Unblocked Web Proxy Mode active. You can browse all sites unblocked inside this pane.
              </span>
              <button 
                onClick={() => setUseWebProxy(false)}
                className="px-2 py-0.5 bg-[#c0c0c0] font-bold border border-t-white border-l-white border-b-black border-r-black hover:bg-gray-100 text-black text-[10px] uppercase cursor-pointer"
              >
                Exit Proxy Mode
              </button>
            </div>
          </div>
        ) : viewMode === 'live' ? (
          /* Live Web Browser Viewport */
          <div className="flex-1 w-full flex flex-col bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white relative overflow-hidden">
            
            {loadingHtml ? (
              /* Connecting/Loading Dialog */
              <div className="absolute inset-0 bg-gray-200 z-50 flex items-center justify-center p-4">
                <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black p-4 w-80 text-xs font-pixel shadow-lg">
                  <div className="flex justify-between items-center bg-[#000080] text-white p-1 mb-3">
                    <span>WebNavigator - Connecting</span>
                    <button className="text-[8px] bg-red-600 px-1 text-white border border-white">✕</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-bold">Locating website: {browserUrl.replace('https://', '').substring(0, 35)}...</p>
                    <div className="w-full bg-[#dfdfdf] border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white h-5 p-[2px] overflow-hidden relative">
                      <div className="bg-[#000080] h-full w-24 animate-[loading-scroll_2s_infinite_linear]" style={{ animationDuration: '1.5s' }} />
                    </div>
                    <style dangerouslySetInnerHTML={{__html: `
                      @keyframes loading-scroll {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(300%); }
                      }
                    `}} />
                  </div>
                </div>
              </div>
            ) : errorMsg ? (
              /* Error fallback dialog */
              <div className="w-full h-full flex flex-col items-center justify-center font-pixel text-black p-4 gap-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-600" />
                <div className="text-sm font-bold max-w-sm">{errorMsg}</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setUseWebProxy(true)}
                    className="px-4 py-1 bg-green-700 text-white font-bold border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs cursor-pointer"
                  >
                    Load via Web Proxy
                  </button>
                  <button 
                    onClick={() => loadLivePage(browserUrl)}
                    className="px-4 py-1 bg-[#c0c0c0] font-bold border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs cursor-pointer"
                  >
                    Retry Connection
                  </button>
                  <a 
                    href={browserUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-4 py-1 bg-[#c0c0c0] text-black font-bold border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-xs text-center flex items-center gap-1"
                  >
                    Open in tab <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              /* Active IFrame rendering rewritten proxy content */
              <iframe 
                srcDoc={htmlContent} 
                onLoad={handleIframeLoad}
                className="w-full h-full border-none bg-white select-text"
              />
            )}
            
            {/* CORS Warning Bar */}
            <div className="bg-[#ffffd0] border-t border-[#808080] p-1.5 flex justify-between items-center text-xs shrink-0 select-none z-40">
              <span className="flex items-center gap-1.5 text-yellow-900 font-bold">
                <AlertCircle className="w-4 h-4 text-yellow-700" />
                Proxied page. Click links to navigate, or open natively to sign in.
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setUseWebProxy(true)}
                  className="px-2 py-0.5 bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black hover:bg-gray-100 text-black text-[10px] uppercase font-bold cursor-pointer"
                >
                  Proxy Mode
                </button>
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

          </div>
        ) : isGithubRepo ? (
          /* Retro GitHub Repository Client layout */
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
            <div className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white p-3 overflow-y-auto select-text">
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
          /* Retro GitHub Profile Client layout */
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

            {/* Profile Content */}
            <div className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white p-3 overflow-y-auto flex flex-col gap-4 text-black select-text">
              {loadingProfile ? (
                <div className="w-full h-full flex flex-col items-center justify-center font-pixel text-black gap-2">
                  <div className="w-8 h-8 border-4 border-t-[#000080] border-[#808080] rounded-full animate-spin" />
                  <span>Fetching profile nodes...</span>
                </div>
              ) : (
                <>
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
          <div className="flex-1 w-full bg-white border border-gray-300" />
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
