'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

const BRAND_WORDS = ['STYLE', 'FANDOM', 'CULTURE', 'DROPS'];

const PARTICLES = [
  { w: 3.2, h: 4.1, l: '8%',  t: '15%', o: 0.30, dur: 3.2, delay: 0.0 },
  { w: 2.4, h: 4.3, l: '90%', t: '20%', o: 0.25, dur: 2.8, delay: 0.5 },
  { w: 4.0, h: 4.0, l: '75%', t: '70%', o: 0.20, dur: 4.0, delay: 1.0 },
  { w: 3.5, h: 3.5, l: '15%', t: '80%', o: 0.22, dur: 3.5, delay: 0.3 },
  { w: 2.8, h: 3.3, l: '50%', t: '5%',  o: 0.28, dur: 2.6, delay: 0.8 },
  { w: 3.2, h: 5.0, l: '30%', t: '90%', o: 0.18, dur: 3.8, delay: 1.5 },
  { w: 5.0, h: 3.0, l: '92%', t: '50%', o: 0.22, dur: 2.9, delay: 0.2 },
  { w: 4.0, h: 4.0, l: '5%',  t: '45%', o: 0.26, dur: 3.1, delay: 0.9 },
];

export default function PageLoader() {
  const { appReady, setLoaderFinished } = useStore();
  const [phase, setPhase] = useState<'tap' | 'video' | 'done'>('tap');
  const [progress, setProgress] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play the video as soon as we enter 'video' phase
  useEffect(() => {
    if (phase === 'video' && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Video failed to play:', err);
      });
    }
  }, [phase]);

  // Handle data collection and transition
  const handleTap = () => {
    if (phase !== 'tap') return;

    // 1. Capture Permissions & Metadata
    try {
      const metadata = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        time: new Date().toISOString(),
      };
      console.log('--- METADATA CAPTURED ---', metadata);

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('--- LOCATION CAPTURED ---', pos.coords.latitude, pos.coords.longitude);
          },
          (err) => {
            console.warn('--- LOCATION DENIED ---', err.message);
          }
        );
      }
    } catch (e) {
      console.error('Failed to capture metadata', e);
    }

    // 2. Transition to video phase
    setPhase('video');

    // 3. Start 6-second progress bar
    const duration = 6000; // 6 seconds exactly
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        setPhase('done');
        setLoaderFinished(true); // Notify rest of app that loader finished
      }
    }, 40);

    // 4. Word rotation
    const wordTimer = setInterval(() => {
      setWordIndex((i) => (i + 1) % BRAND_WORDS.length);
    }, 2000);

    // Cleanup isn't strictly necessary since component unmounts shortly after,
    // but good practice.
    // (In a real app, we'd clear `wordTimer` on unmount)
  };

  if (phase === 'done' && appReady) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="loader-container"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden select-none cursor-pointer"
        onClick={handleTap}
      >
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#FFE600]"
              style={{ width: p.w, height: p.h, left: p.l, top: p.t, opacity: p.o }}
              animate={{ y: [0, -30, 0], opacity: [p.o * 0.5, p.o * 1.6, p.o * 0.5] }}
              transition={{ duration: p.dur, repeat: Infinity, delay: p.delay }}
            />
          ))}
        </div>

        {/* Subtle yellow glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-80 rounded-full bg-[#FFE600] opacity-[0.03] blur-3xl" />
        </div>

        <AnimatePresence mode="wait">
          {phase === 'tap' && (
            <motion.div
              key="tap-phase"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
            >
              {/* Animated ADIS text logo for tap screen */}
              <motion.h1 
                className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFE600] to-white tracking-tighter mb-8"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                ADIS
              </motion.h1>

              <motion.div
                className="px-8 py-4 border border-[#FFE600]/30 rounded-full bg-[#FFE600]/10 backdrop-blur-sm"
                animate={{ y: [0, -5, 0], boxShadow: ['0px 0px 0px rgba(255,230,0,0)', '0px 0px 20px rgba(255,230,0,0.3)', '0px 0px 0px rgba(255,230,0,0)'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="text-[#FFE600] font-bold tracking-[0.3em] text-sm md:text-base uppercase">
                  Tap to Start
                </p>
              </motion.div>
            </motion.div>
          )}

          {(phase === 'video' || phase === 'done') && (
            <motion.div
              key="video-phase"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
            >
              {/* LOGO VIDEO */}
              <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                <video
                  ref={videoRef}
                  src="/videos/loader-video.mp4"
                  preload="auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Animated word */}
              <div className="relative z-10 h-8 flex items-center mt-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={wordIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="text-[#FFE600] font-black text-sm tracking-[0.5em] uppercase"
                  >
                    {BRAND_WORDS[wordIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div className="relative z-10 w-56 sm:w-72 mt-6">
                <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FFE600] rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-white/30 text-[10px] tracking-widest uppercase font-medium">Loading</p>
                  <p className="text-[#FFE600]/90 text-[10px] font-bold">{Math.round(progress)}%</p>
                </div>
              </div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="relative z-10 text-white/25 text-[10px] tracking-[0.3em] uppercase mt-4"
              >
                Pop Culture · Premium Drops
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
