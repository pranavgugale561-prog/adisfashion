'use client';

import { useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCarousel() {
  const products = useStore((s) => s.products);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 260, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-16 sm:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em]">New Arrivals</h2>
            <div className="h-0.5 w-12 bg-[#FFE600] mx-auto mt-2 rounded-full" />
          </motion.div>
          <div className="hidden sm:flex gap-2 absolute right-0">
            <button onClick={() => scroll('left')} className="p-2.5 border-2 border-black/10 rounded-full hover:border-black hover:bg-black hover:text-white transition-all duration-200" aria-label="Scroll left">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll('right')} className="p-2.5 border-2 border-black/10 rounded-full hover:border-black hover:bg-black hover:text-white transition-all duration-200" aria-label="Scroll right">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, i) => (
            <div key={product.id} className="min-w-[200px] sm:min-w-[240px] w-[200px] sm:w-[240px] snap-start flex-shrink-0">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
