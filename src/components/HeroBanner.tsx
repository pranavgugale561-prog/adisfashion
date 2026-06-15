'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, IndianRupee, RefreshCw, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { parseImageLinks } from '@/utils/drive';

export default function HeroBanner() {
  const { landingConfig, loaderFinished } = useStore();
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const desktopImages = parseImageLinks(landingConfig?.heroDesktop);
  const mobileImages = parseImageLinks(landingConfig?.heroMobile);
  
  const activeImages = isMobile
    ? (mobileImages.length > 0 ? mobileImages : ['https://picsum.photos/seed/hero-mobile/800/1200'])
    : (desktopImages.length > 0 ? desktopImages : ['/images/hero_banner_men_1779127853971.png']);

  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (activeImages.length <= 1) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % activeImages.length);
    }, 5000);
    return () => clearInterval(t);
  }, [activeImages.length]);

  // Reset current index if resizing changes the array length and we are out of bounds
  useEffect(() => {
    if (current >= activeImages.length) setCurrent(0);
  }, [activeImages.length, current]);

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + activeImages.length) % activeImages.length);
  };
  const next = () => {
    setDirection(1);
    setCurrent((c) => (c + 1) % activeImages.length);
  };

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

  const safeCurrent = current < activeImages.length ? current : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={loaderFinished ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.96 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full z-10"
    >
      {/* Carousel */}
      <div className="relative w-full h-[60vh] sm:h-[80vh] overflow-hidden shadow-2xl bg-black/5">
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
                alt={`Hero Banner ${safeCurrent + 1}`} 
                referrerPolicy="no-referrer" 
                className="w-full h-full object-cover object-center" 
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        {activeImages.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {activeImages.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {activeImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Feature Bar */}
      <div className="relative z-20 bg-black overflow-hidden">
        {/* Shimmer sweep animation */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,230,0,0.07) 50%, transparent 60%)',
            animation: 'featureShimmer 3.5s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes featureShimmer {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 sm:gap-0">

            {/* Item 1 — Cashback */}
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-[#FFE600] flex items-center justify-center shadow-[0_0_14px_rgba(255,230,0,0.5)] shrink-0 relative">
                <RefreshCw className="w-4 h-4 text-black" />
                <IndianRupee className="w-2.5 h-2.5 text-black absolute bottom-1.5 right-1.5" />
              </div>
              <div>
                <p className="text-[#FFE600] text-[13px] font-black tracking-widest uppercase leading-none">10% Cashback</p>
                <p className="text-white/50 text-[10px] tracking-wider uppercase mt-0.5">On all App orders</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-white/10" />

            {/* Item 2 — Returns */}
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-[#FFE600] flex items-center justify-center shadow-[0_0_14px_rgba(255,230,0,0.5)] shrink-0">
                <RefreshCw className="w-4 h-4 text-black" />
              </div>
              <div>
                <p className="text-[#FFE600] text-[13px] font-black tracking-widest uppercase leading-none">30-Day Returns</p>
                <p className="text-white/50 text-[10px] tracking-wider uppercase mt-0.5">Easy &amp; free exchanges</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-white/10" />

            {/* Item 3 — Shipping */}
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-[#FFE600] flex items-center justify-center shadow-[0_0_14px_rgba(255,230,0,0.5)] shrink-0">
                <Truck className="w-4 h-4 text-black" />
              </div>
              <div>
                <p className="text-[#FFE600] text-[13px] font-black tracking-widest uppercase leading-none">Free Shipping</p>
                <p className="text-white/50 text-[10px] tracking-wider uppercase mt-0.5">On orders ₹999+</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
