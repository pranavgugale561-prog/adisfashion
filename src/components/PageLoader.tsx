'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import InteractiveBackground from './InteractiveBackground';

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

  // ─── Preload the video IMMEDIATELY on mount, before the user taps ───────────
  // Calling .load() forces the browser to start fetching and buffering the file
  // right away, even though the video element is visually hidden.
  // By the time the user taps, the video is already in memory → instant playback.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
  }, []);

  // ─── Play the video as soon as we enter 'video' phase ────────────────────────
  useEffect(() => {
    if (phase === 'video' && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Video autoplay blocked:', err);
      });
    }
  }, [phase]);

  // ─── Handle tap: transition to video + start progress bar ────────────────────
  const handleTap = () => {
    if (phase !== 'tap') return;

    // Capture visitor metadata
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

    setPhase('video');

    // 6-second progress bar
    const duration = 6000;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        setPhase('done');
        setLoaderFinished(true);
      }
    }, 40);

    // Word rotation during video phase
    const wordTimer = setInterval(() => {
      setWordIndex((i) => (i + 1) % BRAND_WORDS.length);
    }, 2000);

    // Clear word timer when done (safety net)
    setTimeout(() => clearInterval(wordTimer), 7000);
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
        {/* ── Background: Live Moving Particles ────────────────────────────── */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <InteractiveBackground />
        </div>

        {/* ── Subtle yellow glow ───────────────────────────────────────────── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-80 h-80 rounded-full bg-[#FFE600] opacity-10 blur-3xl" />
        </div>

        {/* ── VIDEO — always mounted from first render ─────────────────────────
            Hidden (opacity-0) during the tap phase so it buffers silently.
            Revealed (opacity-100) once the user taps.
            This ensures the video is already in browser memory = instant play.  */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 transition-opacity duration-500 ${
            phase === 'video' || phase === 'done' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Logo video */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
            <video
              ref={videoRef}
              src="/videos/loader-video.mp4"
              preload="auto"
              muted
              playsInline
              loop
              className="w-full h-full object-contain"
            />
          </div>

          {/* Animated brand word */}
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
        </div>

        {/* ── TAP PHASE UI ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {phase === 'tap' && (
            <motion.div
              key="tap-phase"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
              className="relative z-20 flex flex-col items-center justify-center pointer-events-none"
            >
              {/* ADIS animated logo */}
              <motion.h1
                className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFE600] to-white tracking-tighter mb-8"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                ADIS
              </motion.h1>

              <motion.div
                className="px-10 py-5 border-2 border-[#FFE600] rounded-full bg-[#FFE600]/20 backdrop-blur-md relative overflow-hidden group cursor-pointer"
                animate={{
                  y: [0, -8, 0],
                  boxShadow: [
                    '0px 0px 15px rgba(255,230,0,0.5)',
                    '0px 0px 35px rgba(255,230,0,0.9)',
                    '0px 0px 15px rgba(255,230,0,0.5)',
                  ],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Scanning highlight beam inside the button */}
                <motion.div 
                  className="absolute inset-0 w-[50%] h-[200%] -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-y-1/4"
                  animate={{ left: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                />
                <p className="text-[#FFE600] font-black tracking-[0.4em] text-lg md:text-xl uppercase drop-shadow-[0_0_10px_rgba(255,230,0,0.8)]">
                  Tap to Start
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
