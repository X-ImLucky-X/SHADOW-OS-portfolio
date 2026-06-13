import React, { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

interface ParticleFieldProps {
  type?: 'lock' | 'desktop';
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ type = 'desktop' }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  const getOptions = (): ISourceOptions => {
    const isLock = type === 'lock';

    return {
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: false,
          },
          onClick: {
            enable: false,
          },
        },
      },
      particles: {
        color: {
          value: isLock ? '#7c3aed' : ['#7c3aed', '#00d4ff', '#00f5a0'],
        },
        links: {
          enable: false,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'out',
          },
          random: true,
          speed: isLock ? 0.6 : 0.3,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            width: 1920,
            height: 1080,
          },
          value: isLock ? 20 : 25,
        },
        opacity: {
          value: { min: 0.1, max: 0.35 },
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 1, max: 3.5 },
        },
      },
      detectRetina: true,
    };
  };

  return (
    <Particles
      id={`tsparticles-${type}`}
      options={getOptions()}
      className="absolute inset-0 -z-10 pointer-events-none"
    />
  );
};
