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

const SNEAKERS_PRODUCTS = [
  { id: 'snk-air-white', title: 'ADIS Air Classic White', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Originals', badges: ['NEW', 'BESTSELLER'] as string[], prices: { base: 3999, sale: 2999, member: 2499 }, images: ['https://picsum.photos/seed/snk1/800/1067', 'https://picsum.photos/seed/snk1b/800/1067', 'https://picsum.photos/seed/snk1c/800/1067'], variants: [{ size: 'S', stock: 5 }, { size: 'M', stock: 12 }, { size: 'L', stock: 18 }, { size: 'XL', stock: 8 }, { size: 'XXL', stock: 3 }], details: { material: 'Leather Upper, Rubber Sole', gsm: 'N/A', wash_care: 'Wipe clean with damp cloth' } },
  { id: 'snk-runner-black', title: 'ADIS Runner Pro Black', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Performance', badges: ['NEW'] as string[], prices: { base: 4499, sale: 3299, member: 2799 }, images: ['https://picsum.photos/seed/snk2/800/1067', 'https://picsum.photos/seed/snk2b/800/1067', 'https://picsum.photos/seed/snk2c/800/1067'], variants: [{ size: 'S', stock: 8 }, { size: 'M', stock: 15 }, { size: 'L', stock: 20 }, { size: 'XL', stock: 10 }, { size: 'XXL', stock: 4 }], details: { material: 'Mesh Upper, EVA Sole', gsm: 'N/A', wash_care: 'Spot clean only' } },
  { id: 'snk-street-red', title: 'ADIS Street Fire Red', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: ['BESTSELLER'] as string[], prices: { base: 3499, sale: 2699, member: 2299 }, images: ['https://picsum.photos/seed/snk3/800/1067', 'https://picsum.photos/seed/snk3b/800/1067', 'https://picsum.photos/seed/snk3c/800/1067'], variants: [{ size: 'S', stock: 6 }, { size: 'M', stock: 14 }, { size: 'L', stock: 16 }, { size: 'XL', stock: 9 }, { size: 'XXL', stock: 2 }], details: { material: 'Suede Upper, Gum Sole', gsm: 'N/A', wash_care: 'Wipe clean, use suede brush' } },
  { id: 'snk-slip-on', title: 'ADIS Slip-On Minimal', category: 'Sneakers', fit_type: 'Slim', fandom_tag: 'Originals', badges: [] as string[], prices: { base: 2499, sale: 1799, member: 1499 }, images: ['https://picsum.photos/seed/snk4/800/1067', 'https://picsum.photos/seed/snk4b/800/1067', 'https://picsum.photos/seed/snk4c/800/1067'], variants: [{ size: 'S', stock: 15 }, { size: 'M', stock: 22 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 12 }, { size: 'XXL', stock: 5 }], details: { material: 'Canvas Upper, Vulcanized Sole', gsm: 'N/A', wash_care: 'Machine wash cold, air dry' } },
  { id: 'snk-hi-top-grey', title: 'ADIS Hi-Top Grey Stone', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: ['NEW'] as string[], prices: { base: 3999, sale: 2999, member: 2499 }, images: ['https://picsum.photos/seed/snk5/800/1067', 'https://picsum.photos/seed/snk5b/800/1067', 'https://picsum.photos/seed/snk5c/800/1067'], variants: [{ size: 'S', stock: 4 }, { size: 'M', stock: 10 }, { size: 'L', stock: 14 }, { size: 'XL', stock: 7 }, { size: 'XXL', stock: 2 }], details: { material: 'Leather & Canvas, Rubber Sole', gsm: 'N/A', wash_care: 'Spot clean only' } },
  { id: 'snk-collab-marvel', title: 'ADIS x Marvel Spidey Force', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Marvel', badges: ['NEW', 'BESTSELLER'] as string[], prices: { base: 4999, sale: 3799, member: 3299 }, images: ['https://picsum.photos/seed/snk6/800/1067', 'https://picsum.photos/seed/snk6b/800/1067', 'https://picsum.photos/seed/snk6c/800/1067'], variants: [{ size: 'S', stock: 3 }, { size: 'M', stock: 8 }, { size: 'L', stock: 10 }, { size: 'XL', stock: 5 }, { size: 'XXL', stock: 1 }], details: { material: 'Limited Edition Fabric Upper', gsm: 'N/A', wash_care: 'Spot clean only, store in box' } },
  { id: 'snk-foam-slide', title: 'ADIS Foam Slide Sandal', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Originals', badges: [] as string[], prices: { base: 1499, sale: 999, member: 799 }, images: ['https://picsum.photos/seed/snk7/800/1067', 'https://picsum.photos/seed/snk7b/800/1067', 'https://picsum.photos/seed/snk7c/800/1067'], variants: [{ size: 'S', stock: 20 }, { size: 'M', stock: 35 }, { size: 'L', stock: 40 }, { size: 'XL', stock: 18 }, { size: 'XXL', stock: 8 }], details: { material: 'EVA Foam', gsm: 'N/A', wash_care: 'Rinse with water' } },
  { id: 'snk-boot-tan', title: 'ADIS Trail Boot Tan', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Originals', badges: ['NEW'] as string[], prices: { base: 5499, sale: 3999, member: 3499 }, images: ['https://picsum.photos/seed/snk8/800/1067', 'https://picsum.photos/seed/snk8b/800/1067', 'https://picsum.photos/seed/snk8c/800/1067'], variants: [{ size: 'S', stock: 4 }, { size: 'M', stock: 9 }, { size: 'L', stock: 12 }, { size: 'XL', stock: 6 }, { size: 'XXL', stock: 2 }], details: { material: 'Full Grain Leather, Lug Sole', gsm: 'N/A', wash_care: 'Leather conditioner, spot clean' } },
];
export default function SneakersPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const { cart, landingConfig, products } = useStore();
  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);
  
  const sneakersBanner = landingConfig?.['catBanner_Sneakers'] || landingConfig?.sneakers;

  const categoryProducts = useMemo(() => {
    return products.filter(p => p.category && p.category.toLowerCase() === 'sneakers');
  }, [products]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-transparent relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em]">Sneakers</h1>
              <p className="text-gray-400 text-sm mt-1 font-medium">
                {landingConfig?.['catPageSubtitle_Sneakers'] || 'Step into the future'} — {categoryProducts.length} styles
              </p>
            </div>
            <button onClick={() => setCartOpen(true)} className="relative p-2 hover:text-[#8B7700] transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#FFE600] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </motion.div>

          {/* Hero banner */}
          <BannerCarousel
            images={parseImageLinks(sneakersBanner)}
            fallbackImage="https://picsum.photos/seed/sneakers-hero/1440/400"
            subtitle={landingConfig?.catBannerSubtitle_Sneakers || 'Drops Every Friday'}
            title={landingConfig?.catBannerTitle_Sneakers || 'Step Up. Stand Out.'}
            description={landingConfig?.catBannerDesc_Sneakers || 'Exclusive kicks. Limited drops. Only at ADIS.'}
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
