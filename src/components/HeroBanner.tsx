'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, IndianRupee, RefreshCw, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

const DEFAULT_SLIDES = [
  {
    image: '/images/hero_banner_men_1779127853971.png',
    tag: 'New Collection',
    title: 'Wear Your Fandom',
    sub: 'Marvel · DC · Anime · Streetwear',
    cta: 'Shop Men',
    href: '/men',
    bg: 'from-black/60',
  },
  {
    image: 'https://picsum.photos/seed/hero-daily/1440/800',
    tag: 'Everyday Essentials',
    title: 'Daily Wear Drops',
    sub: 'Minimalist. Clean. Premium.',
    cta: 'Shop Daily Wear',
    href: '/daily-wear',
    bg: 'from-black/50',
  },
  {
    image: 'https://picsum.photos/seed/hero-sneakers/1440/800',
    tag: 'Limited Drops',
    title: 'Step Up Your Game',
    sub: 'Exclusive kicks. Only at ADIS.',
    cta: 'Shop Sneakers',
    href: '/sneakers',
    bg: 'from-black/60',
  },
  {
    image: 'https://picsum.photos/seed/hero-collab/1440/800',
    tag: 'Collaboration Drop',
    title: 'ADIS × Marvel',
    sub: "Limited edition. Don't miss out.",
    cta: 'Shop Collab',
    href: '/men',
    bg: 'from-black/50',
  },
];

export default function HeroBanner() {
  const { landingConfig } = useStore();
  const [current, setCurrent] = useState(0);

  // Merge admin landingConfig images into slides when available
  const slides = DEFAULT_SLIDES.map((s, i) => {
    if (i === 0 && landingConfig?.heroDesktop) return { ...s, image: landingConfig.heroDesktop };
    if (i === 1 && landingConfig?.heroMobile) return { ...s, image: landingConfig.heroMobile };
    return s;
  });

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const slide = slides[current];

  return (
    <div className="relative w-full z-10">
      {/* Carousel */}
      <div className="relative w-full h-[60vh] sm:h-[80vh] overflow-hidden shadow-2xl">
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-center" />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} to-transparent`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Text overlay */}
            <div className="absolute inset-0 flex items-center px-6 sm:px-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <span className="inline-block bg-[#FFE600] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                  {slide.tag}
                </span>
                <h1 className="text-white font-black text-3xl sm:text-5xl lg:text-6xl uppercase leading-tight tracking-wider max-w-lg">
                  {slide.title}
                </h1>
                <p className="text-white/70 text-sm sm:text-base mt-2 mb-6">{slide.sub}</p>
                <Link
                  href={slide.href}
                  className="inline-block bg-white text-black px-8 py-3 rounded-full text-sm font-black uppercase tracking-wider hover:bg-[#FFE600] hover:text-black transition-all duration-300 shadow-xl"
                >
                  {slide.cta} →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
            />
          ))}
        </div>
      </div>

      {/* Feature Bar */}
      <div className="bg-white/60 backdrop-blur-xl py-5 sm:py-6 border-b border-black/5 relative z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-full border-[1.5px] border-black flex items-center justify-center relative">
                <RefreshCw className="w-5 h-5 text-black" />
                <IndianRupee className="w-2.5 h-2.5 text-black absolute" />
              </div>
              <div className="text-[12px] font-bold tracking-wider text-black leading-snug uppercase">10% Cashback<br />on all App orders</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-full border-[1.5px] border-black">
                <RefreshCw className="w-5 h-5 text-black" />
              </div>
              <div className="text-[12px] font-bold tracking-wider text-black leading-snug uppercase">30 days Easy Returns<br />&amp; Exchanges</div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-7 h-7 text-black stroke-[1.5px]" />
              <div className="text-[12px] font-bold tracking-wider text-black leading-snug uppercase">Free &amp;<br />Fast Shipping</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
