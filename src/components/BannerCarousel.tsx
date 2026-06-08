'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BannerCarouselProps {
  images: string[];
  subtitle?: string;
  title?: string;
  description?: string;
  autoPlayInterval?: number;
  className?: string;
  fallbackImage?: string;
}

export default function BannerCarousel({
  images,
  subtitle,
  title,
  description,
  autoPlayInterval = 5000,
  className = "rounded-2xl overflow-hidden mb-8 w-full aspect-[2/1] md:aspect-[3.5/1] lg:aspect-[4/1] relative",
  fallbackImage
}: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  
  // Use fallback if images array is empty
  const activeImages = images.length > 0 ? images : (fallbackImage ? [fallbackImage] : []);

  useEffect(() => {
    if (activeImages.length <= 1) return;
    
    const t = setInterval(() => {
        setDirection(1);
        setCurrent((c) => (c + 1) % activeImages.length);
    }, autoPlayInterval);
    return () => clearInterval(t);
  }, [activeImages.length, autoPlayInterval]);

  const goToSlide = (i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  if (activeImages.length === 0) return null;

  const safeCurrent = current < activeImages.length ? current : 0;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98
    })
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className={className}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={safeCurrent}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
            scale: { duration: 0.4 }
          }}
          className="absolute inset-0"
        >
          {activeImages[safeCurrent] ? (
            <img 
              src={activeImages[safeCurrent]} 
              alt={title || 'Banner'} 
              referrerPolicy="no-referrer" 
              className="w-full h-full object-cover" 
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center px-8 z-10">
        <div>
          {subtitle && <p className="text-[#FFE600] font-bold text-xs uppercase tracking-widest mb-1">{subtitle}</p>}
          {title && <h2 className="text-white font-black text-2xl sm:text-3xl uppercase">{title}</h2>}
          {description && <p className="text-white/60 text-sm mt-1">{description}</p>}
        </div>
      </div>
      
      {/* Dot Indicators */}
      {activeImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {activeImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
