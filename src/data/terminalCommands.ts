import { resumeData } from './resume';
import { projectsData } from './projects';
import { radarSkillsData } from './skills';

export interface CommandResponse {
  lines: string[];
  action?: string;
  actionArg?: string;
}

export const ASCIILogo = [
  " \x1b[38;5;48m██████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗    ██████╗  ██████╗\x1b[0m",
  " \x1b[38;5;48m██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ██║   ██╔═══██╗██╔════╝\x1b[0m",
  " \x1b[38;5;129m███████╗███████║███████║██║  ██║██║   ██║██║ █╗ ██║   ██║   ██║███████╗\x1b[0m",
  " \x1b[38;5;129m╚════██║██╔══██║██╔══██║██║  ██║██║   ██║██║███╗██║   ██║   ██║╚════██║\x1b[0m",
  " \x1b[38;5;201m███████║██║  ██║██║  ██║██████╔╝╚██████╔╝╚███╔███╔╝██╗╚██████╔╝███████║\x1b[0m",
  " \x1b[38;5;201m╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚══╝╚══╝ ╚═╝ ╚═════╝ ╚══════╝\x1b[0m",
];

export const parseCommand = (input: string, uptimeSec: number): CommandResponse => {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');

  switch (cmd) {
    case 'help':
      return {
        lines: [
          'Available Commands:',
          '  \x1b[38;5;81mhelp\x1b[0m             Display this guide',
          '  \x1b[38;5;81mwhoami\x1b[0m           Display developer identity',
          '  \x1b[38;5;81mskills\x1b[0m           List technical capabilities',
          '  \x1b[38;5;81mprojects\x1b[0m         Show highlights of engineering builds',
          '  \x1b[38;5;81mresume\x1b[0m           Render career resume overview',
          '  \x1b[38;5;81mcontact\x1b[0m          Get contact links and details',
          '  \x1b[38;5;81mls\x1b[0m               List files in current workspace',
          '  \x1b[38;5;81mpwd\x1b[0m              Show absolute directory path',
          '  \x1b[38;5;81mcat [file]\x1b[0m       Read file contents (e.g. cat about.txt)',
          '  \x1b[38;5;81mopen [app]\x1b[0m       Launch GUI apps (terminal|projects|about|resume|skills|contact|ai|game)',
          '  \x1b[38;5;81mclear\x1b[0m            Clear terminal screen',
          '  \x1b[38;5;81mneofetch\x1b[0m         Display OS and hardware telemetry',
          '  \x1b[38;5;81mmatrix\x1b[0m           Trigger Matrix digital rain event',
          '  \x1b[38;5;81mhack\x1b[0m             Run cybersecurity scan',
          '  \x1b[38;5;81msudo [cmd]\x1b[0m       Execute superuser actions (e.g. sudo hire me)'
        ],
      };

    case 'whoami':
      return {
        lines: [
          `Name: \x1b[38;5;48m${resumeData.name}\x1b[0m`,
          `Role: ${resumeData.title}`,
          `Loc:  ${resumeData.location}`,
          `Bio:  ${resumeData.summary}`
        ],
      };

    case 'skills':
      return {
        lines: [
          '\x1b[38;5;129mSkills Inventory:\x1b[0m',
          ...radarSkillsData.map(s => `  ${s.subject.padEnd(15)}: [${'█'.repeat(Math.round(s.value / 10))}${'░'.repeat(10 - Math.round(s.value / 10))}] ${s.value}%`),
          '',
          'Run \x1b[38;5;81mopen skills\x1b[0m to view full graphics and badges.'
        ],
      };

    case 'projects':
      return {
        lines: [
          '\x1b[38;5;201mFeatured Builds:\x1b[0m',
          ...projectsData.map(p => `  \x1b[38;5;81m${p.title}\x1b[0m: ${p.shortDesc} (${p.tech.join(', ')})`),
          '',
          'Run \x1b[38;5;81mopen projects\x1b[0m to open the Software Store app.'
        ],
      };

    case 'resume':
      return {
        lines: [
          `\x1b[38;5;48m${resumeData.name} - Resume Summary\x1b[0m`,
          '--------------------------------------------',
          'Experience:',
          ...resumeData.experience.flatMap(e => [
            `  \x1b[38;5;81m${e.role}\x1b[0m at ${e.company} (${e.period})`,
            ...e.points.map(p => `    - ${p}`)
          ]),
          'Education:',
          ...resumeData.education.map(e => `  \x1b[38;5;81m${e.degree}\x1b[0m - ${e.institution} (${e.period})`),
          '',
          'Run \x1b[38;5;81mopen resume\x1b[0m to launch full document panel.'
        ],
      };

    case 'contact':
      return {
        lines: [
          '\x1b[38;5;220mContact & Social Integrations:\x1b[0m',
          `  Email:    ${resumeData.email}`,
          `  Phone:    ${resumeData.phone}`,
          `  GitHub:   ${resumeData.github}`,
          `  LinkedIn: ${resumeData.linkedin}`,
          '',
          'Type \x1b[38;5;81mopen contact\x1b[0m to fill out the message portal.'
        ],
      };

    case 'ls':
      return {
        lines: [
          'drwxr-xr-x   - guest guest   13 Jun 2026  \x1b[38;5;129m.config\x1b[0m',
          '-rw-r--r-- 294 guest guest   13 Jun 2026  about.txt',
          '-rwxr-xr-x 849 guest guest   13 Jun 2026  \x1b[38;5;48mmatrix.sh\x1b[0m',
          '-rwxr-xr-x 102 guest guest   13 Jun 2026  \x1b[38;5;48mhack.sh\x1b[0m',
          '-rwxr-xr-x 208 guest guest   13 Jun 2026  \x1b[38;5;48mgame.sh\x1b[0m'
        ],
      };

    case 'pwd':
      return {
        lines: ['/home/guest/shadowos'],
      };

    case 'cat':
      if (!arg) {
        return { lines: ['\x1b[38;5;201mError: Missing file argument. Usage: cat [filename]\x1b[0m'] };
      }
      if (arg === 'about.txt') {
        return {
          lines: [
            `Hello! I am ${resumeData.name}, a developer dedicated to exploring creative frontends and machine learning.`,
            `Currently, I am looking for full-time roles or collaborations in AI and Full-Stack Engineering.`,
            `Welcome to ShadowOS. Use this terminal interface to navigate or explore the graphical apps.`
          ]
        };
      }
      if (arg === 'matrix.sh') {
        return {
          lines: [
            '#!/bin/bash',
            '# Initiates visual code override matrix rain',
            'trigger_matrix_rain --color=green --speed=high'
          ]
        };
      }
      if (arg === 'hack.sh') {
        return {
          lines: [
            '#!/bin/bash',
            'echo "Initializing local penetration scan..."',
            'run_breach_sequence'
          ]
        };
      }
      if (arg === 'game.sh') {
        return {
          lines: [
            '#!/bin/bash',
            'echo "Launching CyberSnake game engine..."',
            'open game'
          ]
        };
      }
      return { lines: [`\x1b[38;5;201mError: cat: ${arg}: No such file or directory\x1b[0m`] };

    case 'open':
      if (!arg) {
        return { lines: ['\x1b[38;5;201mError: Specify an application. Usage: open [app_name]\x1b[0m'] };
      }
      const validApps = ['terminal', 'projects', 'about', 'resume', 'skills', 'contact', 'ai', 'game'];
      const targetApp = arg.toLowerCase();
      if (validApps.includes(targetApp)) {
        return {
          lines: [`Opening ${targetApp}...`],
          action: 'open_app',
          actionArg: targetApp,
        };
      }
      return { lines: [`\x1b[38;5;201mError: open: Unknown application "${arg}". Available: terminal, projects, about, resume, skills, contact, ai, game\x1b[0m`] };

    case 'clear':
      return {
        lines: [],
        action: 'clear',
      };

    case 'neofetch':
      const mins = Math.floor(uptimeSec / 60);
      const secs = uptimeSec % 60;
      const uptimeStr = mins > 0 ? `${mins} mins, ${secs} secs` : `${secs} secs`;
      return {
        lines: [
          ...ASCIILogo,
          '',
          `  \x1b[38;5;48m guest@shadowos\x1b[0m`,
          `   ------------`,
          `   OS:        \x1b[38;5;81mShadowOS v2.0\x1b[0m`,
          `   Kernel:    WebKit JS (V8 Engine)`,
          `   Uptime:    ${uptimeStr}`,
          `   Shell:     xterm.js v5.3.0`,
          `   CPU:       Virtual AI Node (Gemini Core)`,
          `   GPU:       HTML5 Canvas2D/WebGL`,
          `   RAM:       8.00 GB (Emulated)`,
          `   Display:   ${window.innerWidth}x${window.innerHeight}`
        ],
      };

    case 'game':
      return {
        lines: ['Opening CyberSnake.exe...'],
        action: 'open_app',
        actionArg: 'game',
      };

    case 'matrix':
      return {
        lines: ['Initiating matrix digital override...'],
        action: 'matrix',
      };

    case 'hack':
      return {
        lines: ['Initializing security clearance scan...'],
        action: 'hack',
      };

    case 'sudo':
      if (!arg) {
        return { lines: ['usage: sudo [command]'] };
      }
      if (arg.toLowerCase() === 'hire me') {
        return {
          lines: [
            'password: ••••••••••••',
            '\x1b[38;5;48mAccess Granted. Authorization accepted.\x1b[0m',
            'Offer letter processed. Output code: HIRE_CONFIRMED.'
          ]
        };
      }
      if (arg.toLowerCase().startsWith('rm -rf')) {
        return {
          lines: [
            'password: ••••••••••••',
            '\x1b[38;5;201mNice try. Security system blocks destructive calls.\x1b[0m'
          ]
        };
      }
      return {
        lines: [
          'password: ••••••••••••',
          `guest is not in the sudoers file. This incident will be reported.`
        ]
      };

    default:
      return {
        lines: [
          `\x1b[38;5;201mCommand not found: ${cmd}\x1b[0m`,
          'Type \x1b[38;5;81mhelp\x1b[0m to display a list of valid terminal instructions.'
        ],
      };
  }
};
