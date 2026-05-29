'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import HeroBanner from '@/components/HeroBanner';
import CategoriesGrid from '@/components/CategoriesGrid';
import ProductCarousel from '@/components/ProductCarousel';
import TrendingBanner from '@/components/TrendingBanner';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { Zap, RefreshCw, Truck, ShieldCheck, Users, Award, Globe, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';

// ── Preview products (same IDs as store, used for display) ──────────────────
const DAILY_WEAR_PREVIEW = [
  { id: 'dw-classic-white', title: 'Classic White Essential Tee', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Essentials', badges: ['NEW'] as string[], prices: { base: 899, sale: 599, member: 499 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 30 }, { size: 'M', stock: 50 }, { size: 'L', stock: 45 }, { size: 'XL', stock: 20 }, { size: 'XXL', stock: 10 }], details: { material: '100% Cotton', gsm: '180 GSM', wash_care: 'Machine wash cold' } },
  { id: 'dw-black-minimal', title: 'Black Minimal Oversized Tee', category: 'Daily Wear', fit_type: 'Oversized', fandom_tag: 'Essentials', badges: ['BESTSELLER'] as string[], prices: { base: 999, sale: 699, member: 549 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 25 }, { size: 'M', stock: 40 }, { size: 'L', stock: 38 }, { size: 'XL', stock: 15 }, { size: 'XXL', stock: 8 }], details: { material: '100% Premium Cotton', gsm: '200 GSM', wash_care: 'Machine wash cold, tumble dry low' } },
  { id: 'dw-navy-hoodie', title: 'Navy Essential Hoodie', category: 'Daily Wear', fit_type: 'Oversized', fandom_tag: 'Essentials', badges: ['NEW', 'BESTSELLER'] as string[], prices: { base: 1999, sale: 1399, member: 1199 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 12 }, { size: 'M', stock: 22 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 18 }, { size: 'XXL', stock: 6 }], details: { material: '80% Cotton 20% Polyester', gsm: '320 GSM', wash_care: 'Machine wash cold, hang dry' } },
  { id: 'dw-polo-red', title: 'ADIS Polo Classic Red', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Essentials', badges: ['BESTSELLER'] as string[], prices: { base: 1099, sale: 799, member: 649 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 22 }, { size: 'M', stock: 38 }, { size: 'L', stock: 42 }, { size: 'XL', stock: 20 }, { size: 'XXL', stock: 8 }], details: { material: 'Pique Cotton', gsm: '200 GSM', wash_care: 'Machine wash cold' } },
];
const SNEAKERS_PREVIEW = [
  { id: 'snk-air-white', title: 'ADIS Air Classic White', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Originals', badges: ['NEW', 'BESTSELLER'] as string[], prices: { base: 3999, sale: 2999, member: 2499 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 5 }, { size: 'M', stock: 12 }, { size: 'L', stock: 18 }, { size: 'XL', stock: 8 }, { size: 'XXL', stock: 3 }], details: { material: 'Leather Upper, Rubber Sole', gsm: 'N/A', wash_care: 'Wipe clean with damp cloth' } },
  { id: 'snk-runner-black', title: 'ADIS Runner Pro Black', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Performance', badges: ['NEW'] as string[], prices: { base: 4499, sale: 3299, member: 2799 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 8 }, { size: 'M', stock: 15 }, { size: 'L', stock: 20 }, { size: 'XL', stock: 10 }, { size: 'XXL', stock: 4 }], details: { material: 'Mesh Upper, EVA Sole', gsm: 'N/A', wash_care: 'Spot clean only' } },
  { id: 'snk-street-red', title: 'ADIS Street Fire Red', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: ['BESTSELLER'] as string[], prices: { base: 3499, sale: 2699, member: 2299 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 6 }, { size: 'M', stock: 14 }, { size: 'L', stock: 16 }, { size: 'XL', stock: 9 }, { size: 'XXL', stock: 2 }], details: { material: 'Suede Upper, Gum Sole', gsm: 'N/A', wash_care: 'Wipe clean, use suede brush' } },
  { id: 'snk-collab-marvel', title: 'ADIS × Marvel Spidey Force', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Marvel', badges: ['NEW', 'BESTSELLER'] as string[], prices: { base: 4999, sale: 3799, member: 3299 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 3 }, { size: 'M', stock: 8 }, { size: 'L', stock: 10 }, { size: 'XL', stock: 5 }, { size: 'XXL', stock: 1 }], details: { material: 'Limited Edition Fabric Upper', gsm: 'N/A', wash_care: 'Spot clean only, store in box' } },
];

const STATS = [
  { value: '50K+', label: 'Happy Customers' },
  { value: 'Jockey', label: 'Authorized Retailer' },
  { value: 'Nalegaon', label: 'Ahmednagar' },
  { value: '4.8★', label: 'Avg Rating' },
];

const FEATURES = [
  { icon: Zap, title: 'Officially Licensed', desc: 'Every design is 100% authentic and officially licensed from the biggest entertainment brands.' },
  { icon: Award, title: 'Premium Quality', desc: 'Premium GSM fabrics, accurate prints, and top-tier finishing — made to last, made to impress.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping on orders ₹999+. Pan-India delivery in 3–5 business days.' },
  { icon: RefreshCw, title: '30-Day Returns', desc: 'No questions asked. Easy returns and exchanges within 30 days of delivery.' },
  { icon: Globe, title: 'Exclusive Drops', desc: 'Limited edition drops you won\'t find anywhere else. Be first with our member early access.' },
  { icon: ShieldCheck, title: 'Secure Shopping', desc: 'SSL encrypted checkout, multiple payment options, and 100% data safety guaranteed.' },
];

const REVIEWS = [
  { id: 1, name: 'Rahul S.', rating: 5, text: "Best collection of men's wear in Ahmednagar! The premium quality is unmatched and they have the latest drops." },
  { id: 2, name: 'Vikram D.', rating: 5, text: "Always my go-to shop for Jockey essentials and daily wear. Great staff and amazing ambiance." },
  { id: 3, name: 'Amit P.', rating: 4, text: "Really good oversized tees. The fit is perfect and the fabric feels premium." },
  { id: 4, name: 'Sanjay K.', rating: 5, text: "Navipeth's hidden gem for fashion. Been shopping here since they opened. Highly recommended!" },
  { id: 5, name: 'Nikhil R.', rating: 5, text: "Top notch clothing! The Marvel collab shirts are exactly what I was looking for. Will visit again soon." },
  { id: 6, name: 'Akshay M.', rating: 5, text: "The sneaker collection is fire. Great prices and completely authentic. Best store in town without a doubt." },
  { id: 7, name: 'Rohan T.', rating: 4, text: "Friendly owner and staff. They helped me find the perfect fit for a wedding party. Great service." },
  { id: 8, name: 'Kunal W.', rating: 5, text: "Amazing variety of fabrics. The hoodies are super comfortable and wash really well. Worth every rupee." },
];

function SectionHeader({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em] text-white">{title}</h2>
        <div className="h-0.5 w-12 bg-[#FFE600] mt-2 rounded-full" />
      </div>
      <Link href={href} className="text-xs font-bold uppercase tracking-wider text-[#FFE600]/70 hover:text-[#FFE600] transition-colors">
        {label} →
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const { appReady, cartOpen, setCartOpen } = useStore();

  useEffect(() => {
    // Start page from top when it's ready
    if (appReady) {
      window.scrollTo(0, 0);
    }
  }, [appReady]);

  return (
    <>
      <AnimatePresence>
        {appReady && (
          <motion.div
            key="home-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col min-h-screen"
          >
            <Navbar />
            <main className="flex-1 pb-28 md:pb-0">

        {/* ══ HERO (id=home) ══════════════════════════════════════════ */}
        <section id="home">
          <HeroBanner />
        </section>

        {/* ── Categories ── */}
        <CategoriesGrid />

        {/* ══ MEN — New Arrivals ══════════════════════════════════════ */}
        <section id="men" className="scroll-mt-20">
          <div className="bg-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em] text-white">Men — New Arrivals</h2>
                  <div className="h-0.5 w-12 bg-[#FFE600] mt-2 rounded-full" />
                </div>
                <Link href="/men" className="text-xs font-bold uppercase tracking-wider text-[#FFE600]/70 hover:text-[#FFE600] transition-colors">
                  View All →
                </Link>
              </motion.div>
            </div>
            <ProductCarousel />
          </div>
        </section>

        {/* ── Trending ── */}
        <TrendingBanner />

        {/* ══ DAILY WEAR ══════════════════════════════════════════════ */}
        <section id="daily-wear" className="scroll-mt-20 bg-black/50 backdrop-blur-sm py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Daily Wear" href="/daily-wear" label="View All Styles" />

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-2xl overflow-hidden mb-8 h-40 sm:h-52 relative">
              <img src="https://picsum.photos/seed/dailywear-banner/1440/350" alt="Daily Wear" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center px-8">
                <div>
                  <p className="text-[#FFE600] font-bold text-xs uppercase tracking-widest mb-1">Everyday Collection</p>
                  <h3 className="text-white font-black text-xl sm:text-2xl uppercase">Minimalist Drops</h3>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {DAILY_WEAR_PREVIEW.map((p, i) => <ProductCard key={p.id} product={p as any} index={i} />)}
            </motion.div>
          </div>
        </section>

        {/* ══ SNEAKERS ════════════════════════════════════════════════ */}
        <section id="sneakers" className="scroll-mt-20 bg-black/40 backdrop-blur-sm py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Sneakers" href="/sneakers" label="View All Kicks" />

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-2xl overflow-hidden mb-8 h-40 sm:h-52 relative">
              <img src="https://picsum.photos/seed/sneakers-banner/1440/350" alt="Sneakers" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center px-8">
                <div>
                  <p className="text-[#FFE600] font-bold text-xs uppercase tracking-widest mb-1">Friday Drops</p>
                  <h3 className="text-white font-black text-xl sm:text-2xl uppercase">Step Up Your Game</h3>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {SNEAKERS_PREVIEW.map((p, i) => <ProductCard key={p.id} product={p as any} index={i} />)}
            </motion.div>
          </div>
        </section>

        {/* ══ ABOUT ═══════════════════════════════════════════════════ */}
        <section id="about" className="scroll-mt-20 py-20 sm:py-28 relative overflow-hidden">
          {/* Yellow glow accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FFE600] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-16">
              <span className="text-[#FFE600] text-xs font-black uppercase tracking-[0.4em] mb-3 block">Our Story</span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-white mb-4 leading-tight">
                Where Fandom<br />Meets Fashion
              </h2>
              <div className="h-0.5 w-16 bg-[#FFE600] mx-auto mb-6 rounded-full" />
              <p className="text-white/50 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                Located in the heart of Ahmednagar at Munot Chambers, Navipeth Road, Nalegaon.
                Adi's Fashion is the premier destination for men's clothing and garments. 
                We bring you the best in premium daily wear, exclusive drops, and we are a proud authorized retailer for top brands like Jockey.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-20">
              {STATS.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="text-center bg-white/[0.04] border border-white/[0.07] rounded-2xl py-6 px-4 backdrop-blur-sm">
                  <p className="text-[#FFE600] font-black text-3xl sm:text-4xl">{stat.value}</p>
                  <p className="text-white/40 text-xs uppercase tracking-wider mt-1 font-semibold">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Feature grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-[#FFE600]/30 rounded-2xl p-6 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE600]/10 flex items-center justify-center mb-4 group-hover:bg-[#FFE600]/20 transition-colors">
                    <f.icon className="w-5 h-5 text-[#FFE600]" />
                  </div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">{f.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Brand story strip */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-3xl overflow-hidden relative">
              <img src="https://picsum.photos/seed/about-brand/1440/500" alt="ADIS Brand" className="w-full h-56 sm:h-72 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent flex items-center px-8 sm:px-14">
                <div className="max-w-md">
                  <p className="text-[#FFE600] font-black text-xs uppercase tracking-[0.3em] mb-3">Munot Chambers · Ahmednagar</p>
                  <h3 className="text-white font-black text-2xl sm:text-3xl uppercase leading-tight mb-4">
                    The Best Men's<br />Clothing Store.
                  </h3>
                  <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-6">
                    From everyday essentials to premium branded wear. Visit us at Navipeth Road, Nalegaon, or shop our exclusive collection online with fast pan-India delivery.
                  </p>
                  <Link href="/#men"
                    onClick={(e) => { e.preventDefault(); document.getElementById('men')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="inline-flex items-center gap-2 bg-[#FFE600] text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider hover:bg-white transition-colors">
                    <Heart className="w-3.5 h-3.5" /> Shop the Collection
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Store Location Map */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mt-20">
              <div className="flex flex-col md:flex-row gap-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden p-2 backdrop-blur-sm">
                
                {/* Map Details */}
                <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center">
                  <span className="text-[#FFE600] text-xs font-black uppercase tracking-[0.4em] mb-3 block">Visit Us</span>
                  <h3 className="text-white font-black text-2xl sm:text-3xl uppercase leading-tight mb-4">
                    Find Us In<br />Ahmednagar
                  </h3>
                  <div className="h-0.5 w-12 bg-[#FFE600] mb-6 rounded-full" />
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Address</p>
                      <p className="text-white/80 text-sm leading-relaxed">
                        Munot Chambers, Navipeth Road,<br />
                        Nalegaon, Ahmednagar – 414001,<br />
                        Maharashtra, India
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Hours</p>
                      <p className="text-white/80 text-sm">Open Daily: 10:00 AM – 9:00 PM</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Contact</p>
                      <p className="text-[#FFE600] font-bold text-sm">+91 88884 05282</p>
                    </div>
                  </div>
                  
                  <a href="https://maps.google.com/?q=Adi's+Fashion,+Ahmednagar" target="_blank" rel="noreferrer"
                    className="mt-8 inline-flex items-center justify-center gap-2 border border-white/10 hover:border-[#FFE600] text-white hover:text-[#FFE600] transition-colors px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider w-max">
                    Get Directions →
                  </a>
                </div>

                {/* Map Iframe */}
                <div className="flex-1 min-h-[300px] md:min-h-full rounded-2xl overflow-hidden">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    className="w-full h-full min-h-[300px]"
                    style={{ filter: "invert(90%) hue-rotate(180deg) contrast(100%)" }}
                    src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=Adi's%20Fashion,%20Munot%20Chambers,%20Navipeth%20Road,%20Nalegaon,%20Ahmednagar&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0}>
                  </iframe>
                </div>

              </div>
            </motion.div>

            {/* Customer Reviews Carousel */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em] text-white">What Our<br/>Customers Say</h3>
                  <div className="h-0.5 w-12 bg-[#FFE600] mt-4 rounded-full" />
                </div>
              </div>
              
              <div className="relative w-full overflow-hidden pb-8">
                {/* Gradient Masks */}
                <div className="absolute top-0 left-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                
                <motion.div 
                  className="flex gap-4 sm:gap-6 w-max"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ ease: "linear", duration: 35, repeat: Infinity }}
                >
                  {[...REVIEWS, ...REVIEWS].map((review, i) => (
                    <div 
                      key={`${review.id}-${i}`}
                      className="flex-none w-[280px] sm:w-[320px] bg-white/[0.03] border border-white/[0.05] hover:border-[#FFE600]/30 rounded-2xl p-6 transition-colors backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(review.rating)].map((_, idx) => (
                          <span key={idx} className="text-[#FFE600] text-sm">★</span>
                        ))}
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed mb-6">&quot;{review.text}&quot;</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FFE600]/20 flex items-center justify-center">
                          <span className="text-[#FFE600] font-black text-xs">{review.name.charAt(0)}</span>
                        </div>
                        <p className="text-white font-bold text-xs uppercase tracking-wider">{review.name}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-16 relative z-10 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.1em] mb-4 text-white">The Fandom Starts Here</h2>
            <div className="h-0.5 w-12 bg-[#FFE600] mx-auto mb-6 rounded-full" />
            <p className="text-white/40 max-w-lg mx-auto mb-8 text-sm">
              Premium pop-culture apparel. Officially licensed. Designed for fans, by fans.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/men"
                className="inline-block bg-[#FFE600] text-black px-10 py-3.5 rounded-full text-sm font-black uppercase tracking-wider hover:bg-white transition-colors shadow-xl shadow-yellow-900/20">
                Explore Full Collection
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 text-white/30 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="text-white font-black text-lg mb-1">
                <span style={{ color: '#FFE600' }}>A</span>DIS
              </h4>
              <p className="text-white/25 text-xs leading-relaxed mt-2">Premium Men's Clothing Store. Munot Chambers, Navipeth Road, Nalegaon, Ahmednagar, Maharashtra 414001. <br/>Call: 8888405282</p>
            </div>
            <div>
              <h4 className="text-white/60 font-bold uppercase tracking-wider text-xs mb-4">Shop</h4>
              <ul className="space-y-2 text-xs">
                {[['Men', '/#men'], ['Daily Wear', '/#daily-wear'], ['Sneakers', '/#sneakers']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white/60 font-bold uppercase tracking-wider text-xs mb-4">Company</h4>
              <ul className="space-y-2 text-xs">
                {[['About', '/#about'], ['Careers', '#'], ['Press', '#']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white/60 font-bold uppercase tracking-wider text-xs mb-4">Support</h4>
              <ul className="space-y-2 text-xs">
                {[['Contact Us', '#'], ['Shipping', '#'], ['Returns', '#'], ['Size Guide', '#']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
            <div>
              © 2026 ADIS. All rights reserved. · Made with <span className="text-[#FFE600]">♥</span> in India
            </div>
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-white/30 hover:text-[#FFE600] transition-colors border border-white/10 hover:border-[#FFE600]/30 px-3 py-1.5 rounded-full">
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
