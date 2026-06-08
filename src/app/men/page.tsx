'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import FilterSidebar from '@/components/FilterSidebar';
import ActiveFilterChips from '@/components/ActiveFilterChips';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/store/useStore';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { convertGDriveUrl, parseImageLinks } from '@/utils/drive';
import BannerCarousel from '@/components/BannerCarousel';

export default function MenPage() {
  const { products, filters, landingConfig } = useStore();
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useStore((s) => s.cart);
  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);
  
  const menBanner = landingConfig?.catBanner_Men || landingConfig?.men || landingConfig?.collection1;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filters.sizes.length > 0) {
        const hasSize = p.variants.some(
          (v) => filters.sizes.includes(v.size) && v.stock > 0
        );
        if (!hasSize) return false;
      }
      if (filters.fits.length > 0 && !filters.fits.includes(p.fit_type))
        return false;
      if (filters.themes.length > 0 && !filters.themes.includes(p.fandom_tag))
        return false;
      if (
        p.prices.sale < filters.priceRange[0] ||
        p.prices.sale > filters.priceRange[1]
      )
        return false;
      return true;
    });
  }, [products, filters]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-transparent relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em]">
                Men
              </h1>
              <p className="text-gray-400 text-sm mt-1 font-medium">
                {landingConfig?.catPageSubtitle_Men || ''} {landingConfig?.catPageSubtitle_Men ? '— ' : ''} {filtered.length} product{filtered.length !== 1 && 's'} found
              </p>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 hover:text-[#8B7700] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#FFE600] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </motion.div>

          {/* Hero banner */}
          <BannerCarousel
            images={parseImageLinks(menBanner)}
            fallbackImage="/images/category_shirts_1779127890248.png"
            subtitle={landingConfig?.catBannerSubtitle_Men || 'Premium Apparel'}
            title={landingConfig?.catBannerTitle_Men || "The Men's Edit"}
            description={landingConfig?.catBannerDesc_Men || 'Elevated essentials and bold statement pieces.'}
          />

          <div className="flex gap-8">
            <FilterSidebar />
            <div className="flex-1 min-w-0">
              <ActiveFilterChips />
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <p className="text-gray-400 text-sm font-medium">No products match your filters.</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
                >
                  {filtered.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
