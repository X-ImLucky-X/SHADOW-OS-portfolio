import { useEffect, useState } from 'react';

export const useReducedMotion = (): boolean => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    // Support browser fallback
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  return shouldReduceMotion;
};
