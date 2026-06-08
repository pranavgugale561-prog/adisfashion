'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackgroundMusic() {
  const [mounted, setMounted]     = useState(false);
  const [playing, setPlaying]     = useState(false);
  const [muted, setMuted]         = useState(false);
  const [showEq, setShowEq]       = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const audio = new Audio('/whistle-bg.mp3');
    audio.loop    = true;
    audio.volume  = 0;
    audio.preload = 'auto';
    audioRef.current = audio;

    const start = async () => {
      if (startedRef.current) return;
      try {
        await audio.play();
        startedRef.current = true;
        setPlaying(true);
        setShowEq(true);
        
        events.forEach(e => window.removeEventListener(e, start));

        let v = 0;
        const fade = setInterval(() => {
          v = Math.min(v + 0.03, 0.35);
          audio.volume = v;
          if (v >= 0.35) clearInterval(fade);
        }, 80);
      } catch (err) {
        console.warn('Autoplay blocked, waiting for valid interaction', err);
      }
    };

    const events: (keyof WindowEventMap)[] = ['click', 'touchstart', 'keydown'];
    events.forEach(e => window.addEventListener(e, start, { passive: true }));
    
    // Attempt to autoplay immediately on load!
    // Note: Modern browsers (Chrome, Safari, iOS) strictly block unmuted autoplay 
    // unless the user has interacted with the site previously.
    start();

    return () => {
      events.forEach(e => window.removeEventListener(e, start));
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleTap = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    audio.muted = next;
    setMuted(next);
    // if unmuting while paused, resume
    if (!next && !playing) {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  if (!mounted) return null;

  // 5 bars with staggered heights / speeds
  const BARS = [
    { h: [0.4, 1.0, 0.5, 0.8, 0.4], dur: 0.65 },
    { h: [0.8, 0.4, 1.0, 0.5, 0.8], dur: 0.50 },
    { h: [0.5, 0.9, 0.3, 1.0, 0.5], dur: 0.75 },
    { h: [1.0, 0.5, 0.8, 0.4, 1.0], dur: 0.55 },
    { h: [0.6, 0.8, 0.4, 0.9, 0.6], dur: 0.70 },
  ];

  const active = playing && !muted;

  return (
    <AnimatePresence>
      {showEq && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.35, ease: 'backOut' }}
          onClick={handleTap}
          aria-label={muted ? 'Unmute music' : 'Mute music'}
          title={muted ? 'Tap to unmute' : 'Tap to mute'}
          className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-40
                     flex items-end gap-[3px] h-8 px-2.5 py-1.5
                     bg-black/80 backdrop-blur-sm rounded-xl
                     border border-white/10 shadow-lg
                     cursor-pointer hover:bg-black/90 transition-colors
                     active:scale-95"
        >
          {BARS.map((bar, i) => (
            <motion.span
              key={i}
              className="block w-[3px] rounded-full"
              style={{
                background: active ? '#FFE600' : '#555',
                minHeight: 4,
              }}
              animate={
                active
                  ? { height: bar.h.map(v => `${v * 22}px`) }
                  : { height: '5px' }
              }
              transition={
                active
                  ? { duration: bar.dur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: i * 0.07 }
                  : { duration: 0.3 }
              }
            />
          ))}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
