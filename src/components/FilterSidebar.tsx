'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
const fits = ['Oversized', 'Regular'];
const themes = ['Marvel', 'Anime', 'DC', 'Rick & Morty'];
const priceRanges: { label: string; range: [number, number] }[] = [
  { label: 'Under ₹999', range: [0, 999] },
  { label: '₹999 - ₹1,499', range: [999, 1499] },
  { label: 'Above ₹1,499', range: [1499, 3000] },
];

export default function FilterSidebar() {
  const { filters, setFilters, resetFilters } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleArrayFilter = (key: 'sizes' | 'fits' | 'themes', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ [key]: updated });
  };

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-xs text-[#FFE600] hover:opacity-70 font-bold uppercase tracking-wider transition-opacity"
        >
          Reset All
        </button>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleArrayFilter('sizes', size)}
              className={cn(
                'w-10 h-10 rounded-lg text-xs font-semibold border transition-colors',
                filters.sizes.includes(size)
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 hover:border-gray-500'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Fit</h4>
        <div className="space-y-2">
          {fits.map((fit) => (
            <label key={fit} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.fits.includes(fit)}
                onChange={() => toggleArrayFilter('fits', fit)}
                className="accent-black"
              />
              <span className="text-sm">{fit}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Fandom</h4>
        <div className="space-y-2">
          {themes.map((theme) => (
            <label key={theme} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.themes.includes(theme)}
                onChange={() => toggleArrayFilter('themes', theme)}
                className="accent-black"
              />
              <span className="text-sm">{theme}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Price</h4>
        <div className="space-y-2">
          {priceRanges.map((pr) => (
            <label key={pr.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={
                  filters.priceRange[0] === pr.range[0] &&
                  filters.priceRange[1] === pr.range[1]
                }
                onChange={() => setFilters({ priceRange: pr.range })}
                className="accent-black"
              />
              <span className="text-sm">{pr.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-36 glass rounded-2xl p-5 shadow-sm">
          {filterContent}
        </div>
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                <h3 className="text-sm font-bold uppercase tracking-wider">Filters</h3>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">{filterContent}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
