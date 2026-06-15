'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Flame, Zap, Footprints } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { convertGDriveUrl } from '@/utils/drive';

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function CategoriesGrid() {
  const { landingConfig, products } = useStore();
  
  // Derive unique categories from products
  const uniqueCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const displayCategories = uniqueCategories.map((cat, index) => {
    const id = cat.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const count = products.filter(p => p.category === cat).length;
    
    // Check if admin has set a custom image for this category grid
    const customImage = landingConfig ? landingConfig[`catGrid_${cat}`] : null;
    
    // Provide some sensible fallbacks for common categories
    let fallbackImage = `https://picsum.photos/seed/${id}/800/800`;
    if (cat === 'Men') fallbackImage = '/images/category_shirts_1779127890248.png';
    if (cat === 'Daily Wear') fallbackImage = '/images/product_tshirt_1_1779127872398.png';
    if (cat === 'Sneakers') fallbackImage = '/images/category_jeans_1779127909257.png';

    const image = customImage ? convertGDriveUrl(customImage) : fallbackImage;

    const customSubtitle = landingConfig ? landingConfig[`catSubtitle_${cat}`] : null;
    const customTag = landingConfig ? landingConfig[`catTag_${cat}`] : null;

    // Feature the first category if there are at least 3 categories
    const isFeatured = index === 0 && uniqueCategories.length >= 3;

    return {
      id,
      title: cat,
      subtitle: customSubtitle || (isFeatured ? 'Featured Collection' : 'Explore Category'),
      tag: customTag || (isFeatured ? 'Hot Drops' : 'Trending'),
      tagIcon: isFeatured ? Flame : Zap,
      image: image as string,
      href: `/#section-${id}`,
      anchor: `section-${id}`,
      accent: '#FFE600',
      count: `${count}+ Styles`,
      span: 'col-span-1 row-span-1',
      textSize: 'text-xl sm:text-2xl',
    };
  });

  if (displayCategories.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 relative z-10 overflow-hidden">

      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#FFE600] opacity-[0.025] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="text-[#FFE600] text-[10px] font-black uppercase tracking-[0.5em] block mb-2">
              Shop by
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-white leading-none">
              Categories
            </h2>
            <div className="h-[3px] w-14 bg-[#FFE600] mt-3 rounded-full" />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-white/25 text-xs tracking-widest uppercase hidden sm:block"
          >
            240+ designs across {uniqueCategories.length} categories
          </motion.p>
        </motion.div>

        {/* ── Bento Grid ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[200px] sm:auto-rows-[270px]"
        >
          {displayCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              variants={{
                hidden: { opacity: 0, scale: 0.94, y: 20 },
                show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
              }}
              className={cat.span}
            >
              <Link
                href={cat.href}
                onClick={(e) => {
                  if (cat.anchor) {
                    e.preventDefault();
                    scrollToSection(cat.anchor);
                  }
                }}
                className="group relative block w-full h-full overflow-hidden rounded-2xl sm:rounded-3xl"
              >
                {/* Image */}
                <motion.div
                  className="absolute inset-0"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Dark gradient overlay — always visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />

                {/* Golden shimmer on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#FFE600]/0 to-[#FFE600]/0 group-hover:from-[#FFE600]/8 group-hover:to-transparent transition-all duration-500"
                />

                {/* Top-left tag badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-1.5 bg-[#FFE600] text-black px-2.5 py-1 rounded-full"
                  >
                    <cat.tagIcon className="w-3 h-3" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">{cat.tag}</span>
                  </motion.div>
                </div>

                {/* Top-right arrow — appears on hover */}
                <motion.div
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/0 group-hover:bg-[#FFE600] flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0"
                >
                  <ArrowUpRight className="w-4 h-4 text-black" />
                </motion.div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <p className="text-white/50 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1">
                    {cat.subtitle}
                  </p>
                  <h3 className={`${cat.textSize} font-black uppercase text-white leading-none tracking-tight group-hover:text-[#FFE600] transition-colors duration-300`}>
                    {cat.title}
                  </h3>

                  {/* Count + animated underline */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-white/30 text-[10px] sm:text-xs font-semibold">{cat.count}</span>
                    <div className="flex items-center gap-1.5 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-[#FFE600] text-[10px] font-black uppercase tracking-wider">Shop Now</span>
                      <ArrowUpRight className="w-3 h-3 text-[#FFE600]" />
                    </div>
                  </div>

                  {/* Yellow underline that grows on hover */}
                  <div className="mt-2 h-[1.5px] bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFE600] rounded-full w-0 group-hover:w-full transition-all duration-500 ease-out" />
                  </div>
                </div>

                {/* Border glow ring on hover */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-white/5 group-hover:border-[#FFE600]/40 transition-colors duration-300 pointer-events-none" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Bottom strip — trust badges ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 grid grid-cols-3 divide-x divide-white/5 bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden"
        >
          {[
            { label: '10% Cashback', sub: 'On all app orders' },
            { label: '30-Day Returns', sub: 'Easy & free exchanges' },
            { label: 'Free Shipping', sub: 'On orders ₹999+' },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center py-4 px-3 sm:px-6">
              <p className="text-white text-[11px] sm:text-xs font-black uppercase tracking-wider">{b.label}</p>
              <p className="text-white/25 text-[9px] sm:text-[10px] mt-0.5">{b.sub}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
