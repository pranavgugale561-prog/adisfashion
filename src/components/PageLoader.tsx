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
  const { appReady } = useStore();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string>('/videos/adis-logo.mp4');
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Preload video into memory as a blob so it plays instantly without buffering
  useEffect(() => {
    let objectUrl: string | null = null;
    fetch('/videos/adis-logo.mp4')
      .then((res) => res.blob())
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setVideoSrc(objectUrl);
        setVideoReady(true);
      })
      .catch(() => {
        // Fallback: just use the original src if fetch fails
        setVideoReady(true);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // Play the video as soon as it's ready and ref is attached
  useEffect(() => {
    if (videoReady && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoReady]);

  useEffect(() => {
    // Word rotation every 2 seconds
    const wordTimer = setInterval(() => {
      setWordIndex((i) => (i + 1) % BRAND_WORDS.length);
    }, 2000);

    // Progress bar over max 5 seconds — finishes early when Firebase sets appReady=true
    const MAX_DURATION = 5000;
    const start = Date.now();

    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / MAX_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        clearInterval(wordTimer);
        setTimeout(() => setVisible(false), 400);
      }
    }, 40);

    return () => { clearInterval(tick); clearInterval(wordTimer); };
  // Run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When Firebase marks the app as ready, dismiss the loader immediately
  useEffect(() => {
    if (appReady) {
      setProgress(100);
      setTimeout(() => setVisible(false), 400);
    }
  }, [appReady]);

  if (appReady) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
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

          {/* Subtle yellow glow behind video */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 rounded-full bg-[#FFE600] opacity-5 blur-3xl" />
          </div>

          {/* ── LOGO VIDEO ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center"
          >
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </motion.div>

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

          {/* Bottom dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                animate={{
                  backgroundColor: progress > (i + 1) * 33 ? '#FFE600' : 'rgba(255,255,255,0.15)',
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
