'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [taps, setTaps] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    setIsClient(true);
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Only track touch events for the tap effect
      const touch = e.touches[0];
      if (!touch) return;
      const newTap = { id: Date.now() + Math.random(), x: touch.clientX, y: touch.clientY };
      setTaps((prev) => [...prev, newTap]);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  if (!isClient) return null;

  return (
    <>
      {/* Desktop Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999] hidden md:block"
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
          scale: isHovering ? 2.5 : 1,
          opacity: isHovering ? 0.85 : 1,
          backgroundColor: isHovering ? '#FFE600' : '#FFFFFF',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28, mass: 0.1 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] hidden md:block"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
          borderColor: isHovering ? 'rgba(255,230,0,0.7)' : 'rgba(255,255,255,0.4)',
          borderWidth: '1px',
          borderStyle: 'solid',
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 20, mass: 0.5 }}
      />

      {/* Mobile Tap Effect */}
      {taps.map((tap) => (
        <motion.div
          key={tap.id}
          className="fixed top-0 left-0 w-12 h-12 rounded-full bg-[#FFE600]/20 border border-[#FFE600] pointer-events-none z-[10000] md:hidden"
          initial={{ opacity: 0.8, scale: 0, x: tap.x - 24, y: tap.y - 24 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onAnimationComplete={() => {
            setTaps((prev) => prev.filter((t) => t.id !== tap.id));
          }}
        />
      ))}
    </>
  );
}
