'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { convertGDriveUrl, parseImageLinks } from '@/utils/drive';
import BannerCarousel from '@/components/BannerCarousel';

const DAILY_WEAR_PRODUCTS = [
  { id: 'dw-classic-white', title: 'Classic White Essential Tee', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Essentials', badges: ['NEW'] as string[], prices: { base: 899, sale: 599, member: 499 }, images: ['https://picsum.photos/seed/dw1/800/1067', 'https://picsum.photos/seed/dw1b/800/1067', 'https://picsum.photos/seed/dw1c/800/1067'], variants: [{ size: 'S', stock: 30 }, { size: 'M', stock: 50 }, { size: 'L', stock: 45 }, { size: 'XL', stock: 20 }, { size: 'XXL', stock: 10 }], details: { material: '100% Cotton', gsm: '180 GSM', wash_care: 'Machine wash cold' } },
  { id: 'dw-black-minimal', title: 'Black Minimal Oversized Tee', category: 'Daily Wear', fit_type: 'Oversized', fandom_tag: 'Essentials', badges: ['BESTSELLER'] as string[], prices: { base: 999, sale: 699, member: 549 }, images: ['https://picsum.photos/seed/dw2/800/1067', 'https://picsum.photos/seed/dw2b/800/1067', 'https://picsum.photos/seed/dw2c/800/1067'], variants: [{ size: 'S', stock: 25 }, { size: 'M', stock: 40 }, { size: 'L', stock: 38 }, { size: 'XL', stock: 15 }, { size: 'XXL', stock: 8 }], details: { material: '100% Premium Cotton', gsm: '200 GSM', wash_care: 'Machine wash cold, tumble dry low' } },
  { id: 'dw-grey-cargo', title: 'Urban Grey Cargo Shorts', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: [] as string[], prices: { base: 1499, sale: 999, member: 799 }, images: ['https://picsum.photos/seed/dw3/800/1067', 'https://picsum.photos/seed/dw3b/800/1067', 'https://picsum.photos/seed/dw3c/800/1067'], variants: [{ size: 'S', stock: 15 }, { size: 'M', stock: 28 }, { size: 'L', stock: 35 }, { size: 'XL', stock: 20 }, { size: 'XXL', stock: 5 }], details: { material: 'Cotton Twill', gsm: '260 GSM', wash_care: 'Machine wash cold, hang dry' } },
  { id: 'dw-navy-hoodie', title: 'Navy Essential Hoodie', category: 'Daily Wear', fit_type: 'Oversized', fandom_tag: 'Essentials', badges: ['NEW', 'BESTSELLER'] as string[], prices: { base: 1999, sale: 1399, member: 1199 }, images: ['https://picsum.photos/seed/dw4/800/1067', 'https://picsum.photos/seed/dw4b/800/1067', 'https://picsum.photos/seed/dw4c/800/1067'], variants: [{ size: 'S', stock: 12 }, { size: 'M', stock: 22 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 18 }, { size: 'XXL', stock: 6 }], details: { material: '80% Cotton 20% Polyester', gsm: '320 GSM', wash_care: 'Machine wash cold, hang dry' } },
  { id: 'dw-track-pants', title: 'ADIS Track Pants', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: [] as string[], prices: { base: 1299, sale: 899, member: 699 }, images: ['https://picsum.photos/seed/dw5/800/1067', 'https://picsum.photos/seed/dw5b/800/1067', 'https://picsum.photos/seed/dw5c/800/1067'], variants: [{ size: 'S', stock: 20 }, { size: 'M', stock: 35 }, { size: 'L', stock: 40 }, { size: 'XL', stock: 25 }, { size: 'XXL', stock: 10 }], details: { material: 'Polyester Blend', gsm: '240 GSM', wash_care: 'Machine wash cold' } },
  { id: 'dw-white-jogger', title: 'White Slim Jogger', category: 'Daily Wear', fit_type: 'Slim', fandom_tag: 'Essentials', badges: ['NEW'] as string[], prices: { base: 1199, sale: 849, member: 699 }, images: ['https://picsum.photos/seed/dw6/800/1067', 'https://picsum.photos/seed/dw6b/800/1067', 'https://picsum.photos/seed/dw6c/800/1067'], variants: [{ size: 'S', stock: 18 }, { size: 'M', stock: 30 }, { size: 'L', stock: 32 }, { size: 'XL', stock: 14 }, { size: 'XXL', stock: 4 }], details: { material: 'Cotton Spandex', gsm: '220 GSM', wash_care: 'Machine wash cold, tumble dry low' } },
  { id: 'dw-polo-red', title: 'ADIS Polo Classic Red', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Essentials', badges: ['BESTSELLER'] as string[], prices: { base: 1099, sale: 799, member: 649 }, images: ['https://picsum.photos/seed/dw7/800/1067', 'https://picsum.photos/seed/dw7b/800/1067', 'https://picsum.photos/seed/dw7c/800/1067'], variants: [{ size: 'S', stock: 22 }, { size: 'M', stock: 38 }, { size: 'L', stock: 42 }, { size: 'XL', stock: 20 }, { size: 'XXL', stock: 8 }], details: { material: 'Pique Cotton', gsm: '200 GSM', wash_care: 'Machine wash cold' } },
  { id: 'dw-bomber-black', title: 'Black Bomber Jacket', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: ['NEW'] as string[], prices: { base: 2999, sale: 1999, member: 1699 }, images: ['https://picsum.photos/seed/dw8/800/1067', 'https://picsum.photos/seed/dw8b/800/1067', 'https://picsum.photos/seed/dw8c/800/1067'], variants: [{ size: 'S', stock: 8 }, { size: 'M', stock: 15 }, { size: 'L', stock: 20 }, { size: 'XL', stock: 10 }, { size: 'XXL', stock: 3 }], details: { material: 'Polyester Shell, Cotton Lining', gsm: '300 GSM', wash_care: 'Dry clean only' } },
];

export default function DailyWearPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const { cart, landingConfig, products } = useStore();
  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);
  
  const dailyWearBanner = landingConfig?.['catBanner_Daily Wear'] || landingConfig?.dailyWear;

  const categoryProducts = useMemo(() => {
    return products.filter(p => p.category && p.category.toLowerCase() === 'daily wear');
  }, [products]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-transparent relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em]">Daily Wear</h1>
              <p className="text-gray-400 text-sm mt-1 font-medium">
                {landingConfig?.['catPageSubtitle_Daily Wear'] || 'Everyday Essentials'} — {categoryProducts.length} styles
              </p>
            </div>
            <button onClick={() => setCartOpen(true)} className="relative p-2 hover:text-[#8B7700] transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#FFE600] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </motion.div>

          {/* Hero banner */}
          <BannerCarousel
            images={parseImageLinks(dailyWearBanner)}
            fallbackImage="https://picsum.photos/seed/dailywear-hero/1440/400"
            subtitle={landingConfig?.['catBannerSubtitle_Daily Wear'] || 'New Collection'}
            title={landingConfig?.['catBannerTitle_Daily Wear'] || 'Everyday Elevated'}
            description={landingConfig?.['catBannerDesc_Daily Wear'] || 'Comfort meets style, every single day'}
          />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {categoryProducts.length > 0 ? (
              categoryProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 font-medium">
                No products found in this category yet.
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
