import React, { useEffect, useState } from 'react';
import { useSystemStore } from './store/systemStore';
import { useTelemetryStore } from './store/telemetryStore';

// Views and Screens
import { Loader } from './components/Loader';
import { BootScreen } from './screens/BootScreen';
import { LockScreen } from './screens/LockScreen';
import { Desktop } from './screens/Desktop';
import { MobilePortfolio } from './screens/MobilePortfolio';

// Overlays
import { Scanline } from './components/Scanline';
import { Cursor } from './components/Cursor';
import { CommandPalette } from './components/CommandPalette';
import { MatrixRain } from './3d/MatrixRain';

export const App: React.FC = () => {
  const { stage } = useSystemStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initialize telemetry background sync
    useTelemetryStore.getState().initialize();
  }, []);

  useEffect(() => {
    const handleViewportResize = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isMobileSize = window.innerWidth < 768 || (window.innerHeight < 768 && window.innerWidth < 1024);
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
      
      setIsMobile(isMobileUA || (isMobileSize && isTouchDevice) || window.innerWidth < 768);
    };

    handleViewportResize();
    window.addEventListener('resize', handleViewportResize);
    return () => {
      window.removeEventListener('resize', handleViewportResize);
    };
  }, []);

  // Force single-page responsive mobile view under 768px width
  if (isMobile) {
    return (
      <>
        {/* Scanline overlay commented out for hardware performance */}
        {/* <Scanline /> */}
        <MobilePortfolio />
      </>
    );
  }

  return (
    <>
      {/* Global visual overlays */}
      {/* <Scanline /> */}
      <MatrixRain />
      
      {/* Operating system flow stage router */}
      {stage === 'loader' && <Loader />}
      {stage === 'boot' && <BootScreen />}
      {stage === 'lock' && <LockScreen />}
      {stage === 'desktop' && <Desktop />}

      {/* Global interactions */}
      <CommandPalette />
      {/* Custom HTML cursor commented out for hardware cursor performance */}
      {/* <Cursor /> */}
    </>
  );
};

export default App;
