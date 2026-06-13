import { create } from 'zustand';

export type AppId = 'terminal' | 'projects' | 'about' | 'resume' | 'skills' | 'contact' | 'ai' | 'game';

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number; // in pixels or percentage, we can initialize with reasonable values
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
}

interface WindowStore {
  windows: Record<AppId, WindowState>;
  activeWindowId: AppId | null;
  maxZIndex: number;
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  maximizeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  updateWindowPosition: (id: AppId, x: number, y: number) => void;
  updateWindowSize: (id: AppId, width: number, height: number) => void;
  cycleWindows: () => void;
}

const initialWindows: Record<AppId, WindowState> = {
  terminal: {
    id: 'terminal',
    title: 'Terminal.exe',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 80,
    y: 80,
    width: 650,
    height: 400,
    minWidth: 400,
    minHeight: 250,
  },
  projects: {
    id: 'projects',
    title: 'Projects.exe',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 120,
    y: 100,
    width: 780,
    height: 500,
    minWidth: 500,
    minHeight: 350,
  },
  about: {
    id: 'about',
    title: 'About.me',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 160,
    y: 120,
    width: 650,
    height: 480,
    minWidth: 400,
    minHeight: 300,
  },
  resume: {
    id: 'resume',
    title: 'Resume.pdf',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 200,
    y: 90,
    width: 620,
    height: 520,
    minWidth: 400,
    minHeight: 350,
  },
  skills: {
    id: 'skills',
    title: 'Skills.sys',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 240,
    y: 140,
    width: 600,
    height: 450,
    minWidth: 450,
    minHeight: 350,
  },
  contact: {
    id: 'contact',
    title: 'Contact.msg',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 280,
    y: 160,
    width: 500,
    height: 450,
    minWidth: 350,
    minHeight: 350,
  },
  ai: {
    id: 'ai',
    title: 'AI_Assistant.bin',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 320,
    y: 80,
    width: 550,
    height: 480,
    minWidth: 400,
    minHeight: 350,
  },
  game: {
    id: 'game',
    title: 'CyberSnake.exe',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 120,
    y: 60,
    width: 840,
    height: 560,
    minWidth: 720,
    minHeight: 460,
  },
};

const saveSessionWindows = (windows: Record<AppId, WindowState>, activeWindowId: AppId | null) => {
  try {
    sessionStorage.setItem('shadowos_windows', JSON.stringify({ windows, activeWindowId }));
  } catch (e) {
    console.error('Failed to save windows session:', e);
  }
};

let storedWindows = initialWindows;
let storedActiveId: AppId | null = null;
try {
  const saved = sessionStorage.getItem('shadowos_windows');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.windows) {
      // Merge to ensure any newly added app windows exist
      storedWindows = {
        ...initialWindows,
        ...parsed.windows
      };
    }
    if (parsed.activeWindowId !== undefined) storedActiveId = parsed.activeWindowId;
  }
} catch (e) {
  console.error('Failed to parse windows session:', e);
  try {
    sessionStorage.removeItem('shadowos_windows');
  } catch (err) {}
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: storedWindows,
  activeWindowId: storedActiveId,
  maxZIndex: Object.values(storedWindows).reduce((max, w) => Math.max(max, w.zIndex), 10),

  openWindow: (id) => {
    const nextZIndex = get().maxZIndex + 1;
    set((state) => {
      const updated = {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isOpen: true,
          isMinimized: false,
          zIndex: nextZIndex,
        },
      };
      saveSessionWindows(updated, id);
      return {
        maxZIndex: nextZIndex,
        activeWindowId: id,
        windows: updated,
      };
    });
  },

  closeWindow: (id) => {
    set((state) => {
      const updatedWindows = {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isOpen: false,
          isMinimized: false,
          isMaximized: false,
        },
      };

      // Recalculate active window
      const openAndNotMinimized = Object.values(updatedWindows).filter(
        (w) => w.isOpen && !w.isMinimized
      );
      
      let nextActiveId: AppId | null = null;
      if (openAndNotMinimized.length > 0) {
        // Find open window with highest zIndex
        const highest = openAndNotMinimized.reduce((prev, current) =>
          prev.zIndex > current.zIndex ? prev : current
        );
        nextActiveId = highest.id;
      }

      saveSessionWindows(updatedWindows, nextActiveId);
      return {
        windows: updatedWindows,
        activeWindowId: nextActiveId,
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => {
      const updatedWindows = {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isMinimized: true,
        },
      };

      // Recalculate active window since this one is now minimized
      const openAndNotMinimized = Object.values(updatedWindows).filter(
        (w) => w.isOpen && !w.isMinimized
      );

      let nextActiveId: AppId | null = null;
      if (openAndNotMinimized.length > 0) {
        const highest = openAndNotMinimized.reduce((prev, current) =>
          prev.zIndex > current.zIndex ? prev : current
        );
        nextActiveId = highest.id;
      }

      saveSessionWindows(updatedWindows, nextActiveId);
      return {
        windows: updatedWindows,
        activeWindowId: nextActiveId,
      };
    });
  },

  maximizeWindow: (id) => {
    set((state) => {
      const updated = {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isMaximized: !state.windows[id].isMaximized,
        },
      };
      saveSessionWindows(updated, state.activeWindowId);
      return { windows: updated };
    });
    get().focusWindow(id);
  },

  focusWindow: (id) => {
    const currentWindow = get().windows[id];
    if (!currentWindow.isOpen || currentWindow.isMinimized) {
      // If it's minimized or closed, open/restore it
      const nextZIndex = get().maxZIndex + 1;
      set((state) => {
        const updated = {
          ...state.windows,
          [id]: {
            ...state.windows[id],
            isOpen: true,
            isMinimized: false,
            zIndex: nextZIndex,
          },
        };
        saveSessionWindows(updated, id);
        return {
          maxZIndex: nextZIndex,
          activeWindowId: id,
          windows: updated,
        };
      });
      return;
    }

    if (get().activeWindowId === id) return;

    const nextZIndex = get().maxZIndex + 1;
    set((state) => {
      const updated = {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          zIndex: nextZIndex,
        },
      };
      saveSessionWindows(updated, id);
      return {
        maxZIndex: nextZIndex,
        activeWindowId: id,
        windows: updated,
      };
    });
  },

  updateWindowPosition: (id, x, y) => {
    set((state) => {
      const updated = {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          x,
          y,
        },
      };
      saveSessionWindows(updated, state.activeWindowId);
      return { windows: updated };
    });
  },

  updateWindowSize: (id, width, height) => {
    set((state) => {
      const updated = {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          width,
          height,
        },
      };
      saveSessionWindows(updated, state.activeWindowId);
      return { windows: updated };
    });
  },

  cycleWindows: () => {
    const openAndNotMinimized = Object.values(get().windows).filter(
      (w) => w.isOpen && !w.isMinimized
    );
    if (openAndNotMinimized.length <= 1) return;

    // Sort by zIndex ascending
    const sorted = [...openAndNotMinimized].sort((a, b) => a.zIndex - b.zIndex);
    // Focus the one with the lowest zIndex, pushing it to the top
    const nextToFocus = sorted[0].id;
    get().focusWindow(nextToFocus);
  },
}));
