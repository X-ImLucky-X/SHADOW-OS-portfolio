import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../store/systemStore';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { projectsData } from '../data/projects';
import { resumeData } from '../data/resume';
import { Github, Linkedin, Mail, ArrowRight, BookOpen, Terminal as TermIcon, ExternalLink } from 'lucide-react';

// --- Typewriter Component ---
const Typewriter: React.FC<{ words: string[] }> = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 1200); // Wait before erasing
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
      setText(words[index].substring(0, subIndex));
    }, reverse ? 35 : 75);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  return (
    <span className="text-accent-green font-mono drop-shadow-[0_0_10px_rgba(0,245,160,0.5)]">
      {text}
      <span className="animate-blink">|</span>
    </span>
  );
};

// --- Phone 3D Model Component ---
const PhoneModel: React.FC = () => {
  const phoneGroupRef = useRef<THREE.Group>(null);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const lastActive = useRef(Date.now());
  const { heroActiveScreen, setHeroActiveScreen } = useSystemStore();

  useFrame((state) => {
    if (!phoneGroupRef.current) return;

    const mouseX = state.pointer.x; // -1 to 1
    const mouseY = state.pointer.y; // -1 to 1

    const isMoving =
      Math.abs(state.pointer.x - lastMouseX.current) > 0.001 ||
      Math.abs(state.pointer.y - lastMouseY.current) > 0.001;

    if (isMoving) {
      lastMouseX.current = state.pointer.x;
      lastMouseY.current = state.pointer.y;
      lastActive.current = Date.now();
    }

    const timeSinceMove = Date.now() - lastActive.current;

    if (timeSinceMove > 3000) {
      // Idle: Slow auto-rotation on Y axis
      phoneGroupRef.current.rotation.y += 0.003;
      phoneGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        phoneGroupRef.current.rotation.x,
        0,
        0.05
      );
    } else {
      // Parallax mouse tilt (limits to ±15 degrees, i.e., ~0.26 radians)
      const targetX = -mouseY * 0.26;
      const targetY = mouseX * 0.26;

      phoneGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        phoneGroupRef.current.rotation.x,
        targetX,
        0.08
      );
      phoneGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        phoneGroupRef.current.rotation.y,
        targetY,
        0.08
      );
    }
  });

  // Swipe handlers for HTML screen overlay
  const handleDragEnd = (_event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      // Swipe left -> Next screen
      setHeroActiveScreen(Math.min(heroActiveScreen + 1, 4));
    } else if (info.offset.x > swipeThreshold) {
      // Swipe right -> Previous screen
      setHeroActiveScreen(Math.max(heroActiveScreen - 1, 0));
    }
  };

  const shouldReduceMotion = useReducedMotion();

  // Slide transitions for pages inside screen
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 320 : -320,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 320 : -320,
      opacity: 0,
    }),
  };

  const [[page, direction], setPageDirection] = useState([heroActiveScreen, 0]);

  useEffect(() => {
    setPageDirection([heroActiveScreen, heroActiveScreen > page ? 1 : -1]);
  }, [heroActiveScreen]);

  return (
    <group ref={phoneGroupRef}>
      {/* Outer Phone Shell Case */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 4.8, 0.18]} />
        <meshPhysicalMaterial
          color="#12121e"
          metalness={0.9}
          roughness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Screen Base (Behind HTML plane to block transparency holes) */}
      <mesh position={[0, 0, 0.091]}>
        <boxGeometry args={[2.24, 4.64, 0.005]} />
        <meshBasicMaterial color="#09090f" />
      </mesh>

      {/* Phone Camera Notch */}
      <mesh position={[0, 2.15, 0.096]}>
        <boxGeometry args={[0.6, 0.12, 0.005]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Emissive Screen Rim Lighting Glow */}
      <mesh position={[0, 0, 0.092]}>
        <boxGeometry args={[2.28, 4.68, 0.002]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.3} />
      </mesh>

      {/* 3D HTML Screen Interface */}
      <Html
        transform
        occlude="blending"
        pointerEvents="auto"
        scale={0.25}
        position={[0, 0, 0.095]}
        style={{
          width: '320px',
          height: '620px',
          backgroundColor: '#09090f',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          boxShadow: '0 0 20px rgba(124, 58, 237, 0.15)',
        }}
      >
        <div className="w-full h-full flex flex-col justify-between p-4 relative font-sans text-white">
          {/* Top Status Bar Mock */}
          <div className="flex justify-between items-center text-[9px] font-mono text-white/45 border-b border-white/5 pb-2">
            <span>SHADOW NETWORK</span>
            <span>15:09 SECURE</span>
          </div>

          {/* Swipeable Screens View */}
          <div className="flex-1 relative overflow-hidden mt-3 mb-2">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={heroActiveScreen}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }
                  }
                  className="absolute inset-0 w-full h-full flex flex-col justify-center select-none"
                >
                  {/* Screen 1: Intro */}
                  {heroActiveScreen === 0 && (
                    <div className="flex flex-col justify-center h-full px-2 font-mono">
                      <div className="text-xs text-accent-cyan tracking-widest uppercase mb-1">SYSTEM // HELLO</div>
                      <h1 className="text-2xl font-bold tracking-tight text-white mb-2 leading-tight">
                        Hi, I'm <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-cyan">
                          Lakshya
                        </span>
                      </h1>
                      <div className="text-xs font-semibold leading-relaxed mb-4 h-12 flex items-center">
                        <Typewriter words={['AI Engineer', 'Full-Stack Developer', 'Cyber Builder']} />
                      </div>
                      <div className="text-[10px] text-white/50 leading-relaxed font-sans mt-2">
                        I engineer intelligent systems at the intersection of local LLMs, neural networks, and rich frontend architectures.
                      </div>
                      <div className="mt-8 flex items-center gap-1 text-[10px] text-accent-violet font-semibold animate-pulse">
                        Swipe left to explore <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  )}

                  {/* Screen 2: Mini Projects */}
                  {heroActiveScreen === 1 && (
                    <div className="flex flex-col justify-between h-full py-1">
                      <div>
                        <div className="text-[10px] font-mono text-accent-violet tracking-widest uppercase mb-2">
                          01 // PROJECTS
                        </div>
                        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                          {projectsData.map((p) => (
                            <div
                              key={p.id}
                              className="bg-bg-surface border border-white/5 p-2.5 rounded-lg flex flex-col gap-1 hover:border-accent-violet/30 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-white truncate">{p.title}</span>
                                <ExternalLink className="w-3 h-3 text-white/30" />
                              </div>
                              <p className="text-[9px] text-white/50 line-clamp-2 leading-relaxed">{p.shortDesc}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {p.tech.slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    className="text-[7px] font-mono bg-white/5 border border-white/10 px-1 py-0.5 rounded text-accent-cyan"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Screen 3: Stats */}
                  {heroActiveScreen === 2 && (
                    <div className="flex flex-col justify-center h-full px-2 font-mono">
                      <div className="text-[10px] text-accent-pink tracking-widest uppercase mb-4">
                        02 // TELEMETRY
                      </div>
                      <div className="bg-bg-surface border border-white/5 p-3 rounded-lg flex flex-col gap-3">
                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                          <span className="text-xs font-bold">Solved Problems</span>
                          <span className="text-lg font-bold text-accent-green">200+</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {/* Easy */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[8px] text-white/60">
                              <span>EASY</span>
                              <span>80 / 80</span>
                            </div>
                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                              <div className="h-full bg-accent-green rounded-full" style={{ width: '100%' }} />
                            </div>
                          </div>
                          {/* Medium */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[8px] text-white/60">
                              <span>MEDIUM</span>
                              <span>90 / 120</span>
                            </div>
                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                              <div className="h-full bg-accent-cyan rounded-full" style={{ width: '75%' }} />
                            </div>
                          </div>
                          {/* Hard */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[8px] text-white/60">
                              <span>HARD</span>
                              <span>30 / 50</span>
                            </div>
                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                              <div className="h-full bg-accent-pink rounded-full" style={{ width: '60%' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Screen 4: GitHub Contribution Grid */}
                  {heroActiveScreen === 3 && (
                    <div className="flex flex-col justify-center h-full px-2 font-mono">
                      <div className="text-[10px] text-accent-cyan tracking-widest uppercase mb-3">
                        03 // SOURCE_LOGS
                      </div>
                      <div className="bg-bg-surface border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                        <div className="flex justify-between text-[9px] border-b border-white/10 pb-1.5 font-bold">
                          <span>GitHub Activity</span>
                          <span className="text-accent-cyan">Active Dev</span>
                        </div>
                        {/* 8x12 grid representing 52 weeks activity */}
                        <div className="grid grid-cols-12 gap-1 mt-1 justify-items-center">
                          {Array.from({ length: 72 }).map((_, i) => {
                            // Pseudo random contribution levels
                            const level = (i * 7 + 13) % 5;
                            const colors = [
                              'bg-white/5',
                              'bg-emerald-950/40 border border-emerald-900/10',
                              'bg-emerald-800/60',
                              'bg-emerald-500/80',
                              'bg-accent-green',
                            ];
                            return (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-[1px] ${colors[level]}`}
                                title={`Activity scale: ${level}`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-[7px] text-white/30 mt-2">
                          <span>Less</span>
                          <div className="flex gap-0.5">
                            <div className="w-1.5 h-1.5 bg-white/5" />
                            <div className="w-1.5 h-1.5 bg-emerald-950/40" />
                            <div className="w-1.5 h-1.5 bg-emerald-800/60" />
                            <div className="w-1.5 h-1.5 bg-emerald-500/80" />
                            <div className="w-1.5 h-1.5 bg-accent-green" />
                          </div>
                          <span>More</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Screen 5: Contact */}
                  {heroActiveScreen === 4 && (
                    <div className="flex flex-col justify-center h-full px-2 font-mono">
                      <div className="text-[10px] text-accent-amber tracking-widest uppercase mb-4">
                        04 // TRANSMIT
                      </div>
                      <div className="flex flex-col gap-3">
                        <a
                          href={`mailto:${resumeData.email}`}
                          className="bg-bg-surface border border-white/5 hover:border-accent-green/35 hover:bg-accent-green/5 p-3 rounded-lg flex items-center gap-3 transition-colors clickable text-white group"
                        >
                          <Mail className="w-4 h-4 text-accent-green group-hover:scale-110 transition-transform" />
                          <div className="flex flex-col">
                            <span className="text-[9px] text-white/40">EMAIL</span>
                            <span className="text-[10px] font-bold">Mail Box</span>
                          </div>
                        </a>
                        
                        <a
                          href={resumeData.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-bg-surface border border-white/5 hover:border-accent-cyan/35 hover:bg-accent-cyan/5 p-3 rounded-lg flex items-center gap-3 transition-colors clickable text-white group"
                        >
                          <Github className="w-4 h-4 text-accent-cyan group-hover:scale-110 transition-transform" />
                          <div className="flex flex-col">
                            <span className="text-[9px] text-white/40">GITHUB</span>
                            <span className="text-[10px] font-bold">{resumeData.github.replace('https://github.com/', '')}</span>
                          </div>
                        </a>

                        <a
                          href={resumeData.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-bg-surface border border-white/5 hover:border-accent-pink/35 hover:bg-accent-pink/5 p-3 rounded-lg flex items-center gap-3 transition-colors clickable text-white group"
                        >
                          <Linkedin className="w-4 h-4 text-accent-pink group-hover:scale-110 transition-transform" />
                          <div className="flex flex-col">
                            <span className="text-[9px] text-white/40">LINKEDIN</span>
                            <span className="text-[10px] font-bold">Lakshya Profile</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Bottom Swiper Dots Indicators */}
          <div className="flex justify-center gap-1.5 py-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroActiveScreen(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all clickable ${
                  idx === heroActiveScreen ? 'w-4 bg-accent-green' : 'bg-white/20 hover:bg-white/45'
                }`}
                aria-label={`Go to screen ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
};

// --- Main Lazy-Loadable Export Component ---
export default function PhoneHero() {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Three.js R3F Canvas */}
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
        shadows
      >
        <ambientLight color="#1a1a2e" intensity={0.4} />
        
        {/* Soft fill light */}
        <directionalLight color="#7c3aed" intensity={0.6} position={[-5, 5, 2]} />
        
        {/* Glowing pointLight behind screen for backing light */}
        <pointLight color="#00f5a0" intensity={1.5} distance={5} position={[0, 0, -1]} />
        
        {/* Directional light acting as rim lighting */}
        <directionalLight color="#ffffff" intensity={1.2} position={[0, 5, -2]} />

        <PhoneModel />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
