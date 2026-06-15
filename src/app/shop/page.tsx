'use client';

import { useState, useMemo, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, X, Search, ChevronDown, LayoutGrid, List,
  Tag, Shirt, Flame, ShoppingBag, Star, Zap, ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Filter constants ────────────────────────────────────────────────────────
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const FITS = ['Regular', 'Oversized', 'Slim'];
const PRICE_PRESETS = [
  { label: 'All', range: [0, 99999] as [number, number] },
  { label: 'Under ₹999', range: [0, 999] as [number, number] },
  { label: '₹999–₹1,999', range: [999, 1999] as [number, number] },
  { label: '₹2,000–₹3,999', range: [2000, 3999] as [number, number] },
  { label: '₹4,000+', range: [4000, 99999] as [number, number] },
];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'bestseller', label: 'Bestsellers First' },
];

interface ShopFilters {
  categories: string[];
  sizes: string[];
  fits: string[];
  fandoms: string[];
  priceRange: [number, number];
  badges: string[];
  search: string;
  sort: string;
}

const defaultFilters: ShopFilters = {
  categories: [],
  sizes: [],
  fits: [],
  fandoms: [],
  priceRange: [0, 99999],
  badges: [],
  search: '',
  sort: 'featured',
};

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function ShopPage() {
  const { products, isMember } = useStore();
  const [filters, setFilters] = useState<ShopFilters>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gridView, setGridView] = useState<'grid' | 'list'>('grid');

  // Derive dynamic options from products
  const allCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).filter(Boolean).sort(),
    [products]
  );
  const allFandoms = useMemo(
    () => Array.from(new Set(products.map((p) => p.fandom_tag))).filter(Boolean).sort(),
    [products]
  );

  const updateFilter = useCallback(<K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length) count += filters.categories.length;
    if (filters.sizes.length) count += filters.sizes.length;
    if (filters.fits.length) count += filters.fits.length;
    if (filters.fandoms.length) count += filters.fandoms.length;
    if (filters.badges.length) count += filters.badges.length;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 99999) count++;
    return count;
  }, [filters]);

  // Apply filters + sort
  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      // Category
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      // Size (has stock in selected sizes)
      if (filters.sizes.length) {
        const ok = p.variants.some((v) => filters.sizes.includes(v.size) && v.stock > 0);
        if (!ok) return false;
      }
      // Fit
      if (filters.fits.length && !filters.fits.includes(p.fit_type)) return false;
      // Fandom
      if (filters.fandoms.length && !filters.fandoms.includes(p.fandom_tag)) return false;
      // Badges
      if (filters.badges.length) {
        const ok = filters.badges.some((b) => p.badges.includes(b));
        if (!ok) return false;
      }
      // Price
      if (p.prices.sale < filters.priceRange[0] || p.prices.sale > filters.priceRange[1]) return false;
      // Search
      if (filters.search.trim().length >= 2) {
        const q = filters.search.toLowerCase();
        const hit =
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fandom_tag.toLowerCase().includes(q) ||
          p.fit_type.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });

    // Sort
    switch (filters.sort) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.prices.sale - b.prices.sale);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.prices.sale - a.prices.sale);
        break;
      case 'newest':
        result = [...result].sort((a) => (a.badges.includes('NEW') ? -1 : 1));
        break;
      case 'bestseller':
        result = [...result].sort((a) => (a.badges.includes('BESTSELLER') ? -1 : 1));
        break;
      default:
        break;
    }

    return result;
  }, [products, filters]);

  // ── Filter Panel (shared between sidebar + mobile sheet) ──────────────────
  const filterPanel = (
    <div className="space-y-7 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-white/60">Filters</span>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-[10px] font-black uppercase tracking-wider text-[#FFE600] hover:opacity-70 transition-opacity"
          >
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Category</h4>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter('categories', toggle(filters.categories, cat))}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all',
                filters.categories.includes(cat)
                  ? 'bg-[#FFE600] text-black border-[#FFE600]'
                  : 'border-white/15 text-white/60 hover:border-[#FFE600]/50 hover:text-white'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Status</h4>
        <div className="flex flex-wrap gap-2">
          {['NEW', 'BESTSELLER'].map((badge) => (
            <button
              key={badge}
              onClick={() => updateFilter('badges', toggle(filters.badges, badge))}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5',
                filters.badges.includes(badge)
                  ? badge === 'NEW' ? 'bg-[#FFE600] text-black border-[#FFE600]' : 'bg-white text-black border-white'
                  : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
              )}
            >
              {badge === 'NEW' ? <Zap className="w-3 h-3" /> : <Star className="w-3 h-3" />}
              {badge}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => updateFilter('sizes', toggle(filters.sizes, size))}
              className={cn(
                'w-10 h-10 rounded-xl text-xs font-bold border transition-all',
                filters.sizes.includes(size)
                  ? 'bg-[#FFE600] text-black border-[#FFE600]'
                  : 'border-white/15 text-white/60 hover:border-[#FFE600]/50 hover:text-white'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Fit */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Fit</h4>
        <div className="flex flex-wrap gap-2">
          {FITS.map((fit) => (
            <button
              key={fit}
              onClick={() => updateFilter('fits', toggle(filters.fits, fit))}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all',
                filters.fits.includes(fit)
                  ? 'bg-[#FFE600] text-black border-[#FFE600]'
                  : 'border-white/15 text-white/60 hover:border-[#FFE600]/50 hover:text-white'
              )}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      {/* Fandom */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Fandom / Tag</h4>
        <div className="flex flex-wrap gap-2">
          {allFandoms.map((tag) => (
            <button
              key={tag}
              onClick={() => updateFilter('fandoms', toggle(filters.fandoms, tag))}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all',
                filters.fandoms.includes(tag)
                  ? 'bg-[#FFE600] text-black border-[#FFE600]'
                  : 'border-white/15 text-white/50 hover:border-[#FFE600]/50 hover:text-white'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Price Range</h4>
        <div className="space-y-2">
          {PRICE_PRESETS.map((pr) => (
            <button
              key={pr.label}
              onClick={() => updateFilter('priceRange', pr.range)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-between',
                filters.priceRange[0] === pr.range[0] && filters.priceRange[1] === pr.range[1]
                  ? 'bg-[#FFE600]/15 border-[#FFE600]/50 text-[#FFE600]'
                  : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white'
              )}
            >
              {pr.label}
              {filters.priceRange[0] === pr.range[0] && filters.priceRange[1] === pr.range[1] && (
                <span className="w-2 h-2 rounded-full bg-[#FFE600]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative z-10 pb-32 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            {/* Title row */}
            <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
              <div>
                <span className="text-[#FFE600] text-[10px] font-black uppercase tracking-[0.4em] block mb-1">
                  Adi's Fashion
                </span>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-[0.12em] text-white leading-none">
                  Shop All
                </h1>
                <div className="h-0.5 w-10 bg-[#FFE600] mt-2 rounded-full" />
              </div>
              <p className="text-white/40 text-sm font-medium self-center">
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Search + sort + view toggle row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2.5 focus-within:border-[#FFE600]/50 transition-colors">
                <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search products, fandoms, categories…"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                />
                {filters.search && (
                  <button onClick={() => updateFilter('search', '')} className="text-white/30 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="appearance-none bg-white/[0.05] border border-white/10 rounded-full px-4 py-2.5 pr-9 text-sm text-white/70 outline-none cursor-pointer hover:border-white/20 transition-colors font-medium"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#111]">
                      {o.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              </div>

              {/* Grid/List toggle (desktop only) */}
              <div className="hidden sm:flex items-center bg-white/[0.05] border border-white/10 rounded-full p-1">
                <button
                  onClick={() => setGridView('grid')}
                  className={cn(
                    'p-2 rounded-full transition-all',
                    gridView === 'grid' ? 'bg-[#FFE600] text-black' : 'text-white/40 hover:text-white'
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setGridView('list')}
                  className={cn(
                    'p-2 rounded-full transition-all',
                    gridView === 'list' ? 'bg-[#FFE600] text-black' : 'text-white/40 hover:text-white'
                  )}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-wrap gap-2 mt-4"
              >
                {filters.categories.map((c) => (
                  <ActiveChip key={`cat-${c}`} label={c} onRemove={() => updateFilter('categories', toggle(filters.categories, c))} />
                ))}
                {filters.sizes.map((s) => (
                  <ActiveChip key={`sz-${s}`} label={`Size: ${s}`} onRemove={() => updateFilter('sizes', toggle(filters.sizes, s))} />
                ))}
                {filters.fits.map((f) => (
                  <ActiveChip key={`fit-${f}`} label={f} onRemove={() => updateFilter('fits', toggle(filters.fits, f))} />
                ))}
                {filters.fandoms.map((f) => (
                  <ActiveChip key={`fan-${f}`} label={f} onRemove={() => updateFilter('fandoms', toggle(filters.fandoms, f))} />
                ))}
                {filters.badges.map((b) => (
                  <ActiveChip key={`badge-${b}`} label={b} onRemove={() => updateFilter('badges', toggle(filters.badges, b))} />
                ))}
                {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 99999) && (
                  <ActiveChip
                    label={`₹${filters.priceRange[0]}–${filters.priceRange[1] === 99999 ? '∞' : '₹' + filters.priceRange[1]}`}
                    onRemove={() => updateFilter('priceRange', [0, 99999])}
                  />
                )}
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-black uppercase tracking-wider text-white/30 hover:text-[#FFE600] transition-colors px-2"
                >
                  Clear All
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* ── Main layout: Sidebar + Grid ─────────────────────────────── */}
          <div className="flex gap-8 items-start">

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-24 self-start">
              <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-sm">
                {filterPanel}
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-24"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-7 h-7 text-white/20" />
                    </div>
                    <p className="text-white/30 text-sm font-medium">No products match your filters.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-4 text-[#FFE600] text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                    >
                      Reset Filters
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'grid gap-4 sm:gap-5',
                      gridView === 'grid'
                        ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1 sm:grid-cols-2'
                    )}
                  >
                    {filtered.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile Filter Button (fixed bottom, above dock) ─────────────── */}
      <div className="lg:hidden fixed bottom-[88px] left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 bg-black/90 backdrop-blur-xl border border-white/15 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-2xl shadow-black/60"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-[#FFE600] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile Filter Bottom Sheet ───────────────────────────────────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setMobileFiltersOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0d0d0d] border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] sticky top-0 bg-[#0d0d0d] z-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">
                  Filters {activeFilterCount > 0 && <span className="text-[#FFE600]">({activeFilterCount})</span>}
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 py-6 pb-10">
                {filterPanel}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-8 w-full bg-[#FFE600] text-black font-black uppercase tracking-wider text-sm py-3.5 rounded-full hover:bg-white transition-colors"
                >
                  See {filtered.length} Product{filtered.length !== 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Small helper: active filter chip ────────────────────────────────────────
function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#FFE600]/10 border border-[#FFE600]/30 text-[#FFE600] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="text-[#FFE600]/60 hover:text-[#FFE600] transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
