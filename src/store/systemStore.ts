import { create } from 'zustand';

export type SystemStage = 'loader' | 'boot' | 'lock' | 'desktop';

interface SystemStore {
  stage: SystemStage;
  loadingProgress: number;
  isCommandPaletteOpen: boolean;
  isMatrixActive: boolean;
  wallpaperStyle: 'neon-city' | 'grid' | 'neon-waves' | 'retro-teal';
  setStage: (stage: SystemStage) => void;
  setLoadingProgress: (progress: number) => void;
  toggleCommandPalette: () => void;
  setCommandPalette: (isOpen: boolean) => void;
  toggleMatrix: (active?: boolean) => void;
  setWallpaperStyle: (style: 'neon-city' | 'grid' | 'neon-waves' | 'retro-teal') => void;
}

const getInitialStage = (): SystemStage => {
  try {
    const saved = sessionStorage.getItem('shadowos_stage');
    if (saved === 'loader' || saved === 'boot' || saved === 'lock' || saved === 'desktop') {
      return saved;
    }
  } catch (e) {}
  return 'loader';
};

export const useSystemStore = create<SystemStore>((set) => ({
  stage: getInitialStage(),
  loadingProgress: 0,
  isCommandPaletteOpen: false,
  isMatrixActive: false,
  wallpaperStyle: (sessionStorage.getItem('shadowos_wallpaper') as 'neon-city' | 'grid' | 'neon-waves' | 'retro-teal') || 'neon-city',

  setStage: (stage) => {
    sessionStorage.setItem('shadowos_stage', stage);
    set({ stage });
  },
  setLoadingProgress: (loadingProgress) => set({ loadingProgress }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPalette: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  toggleMatrix: (active) => set((state) => ({ isMatrixActive: active !== undefined ? active : !state.isMatrixActive })),
  setWallpaperStyle: (wallpaperStyle) => {
    sessionStorage.setItem('shadowos_wallpaper', wallpaperStyle);
    set({ wallpaperStyle });
  },
}));

