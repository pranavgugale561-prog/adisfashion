'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PricingDisplay from '@/components/PricingDisplay';
import SizeGrid from '@/components/SizeGrid';
import MembershipUpsell from '@/components/MembershipUpsell';
import DetailAccordions from '@/components/DetailAccordions';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingBag, Heart, Truck, ShieldCheck, RotateCcw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface Props {
  product: Product;
  backHref?: string;
  backLabel?: string;
}

export default function ProductDetailContent({ product, backHref = '/men', backLabel = 'Men' }: Props) {
  const { addToCart, cart, wishlist, toggleWishlist, isMember, cartOpen, setCartOpen } = useStore();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);
  const isWishlisted = wishlist.includes(product.id);
  const variant = (product.variants || []).find((v) => v.size === selectedSize);
  const effectivePrice = isMember ? product.prices.member : product.prices.sale;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      productId: product.id,
      title: product.title,
      image: product.images[0],
      size: selectedSize,
      quantity: 1,
      price: effectivePrice,
    });
    setAddedToCart(true);
    setCartOpen(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-gray-50/50 to-white relative z-10 pb-28 md:pb-0 overflow-hidden">
        {/* Subtle decorative background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFE600]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-200/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-bold uppercase tracking-widest mb-8 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to {backLabel}
          </Link>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Images - 7 columns */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="lg:col-span-7">
              <div className="flex gap-4 h-full">
                {/* Thumbnails */}
                <div className="hidden sm:flex flex-col gap-3">
                  {(product.images || []).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        'w-20 h-24 rounded-2xl border-2 overflow-hidden transition-all duration-300 relative group',
                        selectedImage === i 
                          ? 'border-black ring-4 ring-black/5 scale-[1.02] shadow-md' 
                          : 'border-transparent hover:border-gray-300 shadow-sm'
                      )}
                    >
                      <div className={cn(
                        "absolute inset-0 bg-black/5 transition-opacity z-10",
                        selectedImage === i ? "opacity-0" : "opacity-100 group-hover:opacity-0"
                      )} />
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </button>
                  ))}
                </div>
                
                {/* Main Image */}
                <div className="flex-1 relative group">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="aspect-[4/5] sm:aspect-[3/4] bg-gray-100 rounded-[2rem] overflow-hidden relative shadow-2xl shadow-black/5 ring-1 ring-black/5"
                  >
                    <img 
                      src={product.images[selectedImage]} 
                      alt={product.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                    
                    {/* Inner elegant shadow gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5 pointer-events-none" />

                    <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                      {(product.badges || []).map((badge) => (
                        <span
                          key={badge}
                          className={cn(
                            'text-[10px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md border',
                            badge === 'NEW' ? 'bg-[#FFE600] text-black border-[#FFE600]/20' :
                            badge === 'BESTSELLER' ? 'bg-black/90 text-white border-white/10' :
                            'bg-white/70 text-black border-white/40'
                          )}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Details - 5 columns */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }} className="lg:col-span-5 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-[#b89f00] font-black uppercase tracking-widest">
                  {product.fandom_tag} <span className="text-gray-300 mx-1">•</span> {product.fit_type}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold tracking-widest bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100" title="Total Product Views">
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                  {((Math.floor(product.id.length * 423.5) % 15000 + 3000) / 1000).toFixed(1)}k views
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-black to-gray-700 leading-none">
                {product.title}
              </h1>

              <div className="p-4 bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-100 shadow-sm mb-6">
                <PricingDisplay prices={product.prices} size="lg" />
              </div>

              <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">
                Premium quality <span className="text-black font-semibold">{product.details.material.toLowerCase()}</span> featuring exclusive <span className="text-black font-semibold">{product.fandom_tag}</span> design. Part of the official ADIS collection.
              </p>

              <hr className="my-2 border-gray-100" />

              <div className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-black uppercase tracking-widest text-gray-900">Select Size</p>
                  {selectedSize && variant && (
                    <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md", 
                      variant.stock > 10 ? 'bg-green-50 text-green-700' : 
                      variant.stock > 0 ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                    )}>
                      {variant.stock > 10 ? 'In Stock' : variant.stock > 0 ? `Only ${variant.stock} left` : 'Out of Stock'}
                    </span>
                  )}
                </div>
                <SizeGrid variants={product.variants || []} selectedSize={selectedSize} onSelect={(size) => setSelectedSize(size)} />
              </div>

              <div className="mt-2 space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className={cn(
                    'w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden',
                    selectedSize
                      ? addedToCart 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                        : 'bg-black text-[#FFE600] shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  )}
                >
                  {/* Button shine effect */}
                  {selectedSize && !addedToCart && (
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                  )}
                  
                  <ShoppingBag className={cn("w-5 h-5 transition-transform duration-300", selectedSize && "group-hover:scale-110")} />
                  <span className="relative z-10">
                    {addedToCart ? 'Added to Cart!' : selectedSize ? `Add to Cart — ${formatCurrency(effectivePrice)}` : 'Select a Size'}
                  </span>
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={cn(
                      'flex-1 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2',
                      isWishlisted 
                        ? 'border-2 border-[#FFE600] bg-[#FFE600]/10 text-black shadow-md' 
                        : 'border-2 border-gray-200 hover:border-black hover:bg-gray-50 text-gray-600 hover:text-black'
                    )}
                  >
                    <Heart className={cn('w-4 h-4 transition-all', isWishlisted && 'fill-[#FFE600] text-[#FFE600] scale-110')} />
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </button>

                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/p/${product.id}`;
                      if (navigator.share) {
                        navigator.share({
                          title: `${product.title} - ADIS`,
                          url: shareUrl
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="w-[56px] h-[56px] rounded-2xl text-gray-500 hover:text-black border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-300 flex items-center justify-center group"
                    aria-label="Share product"
                  >
                    <svg className="transition-transform group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <MembershipUpsell />
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8 p-5 bg-white/50 backdrop-blur-md rounded-2xl border border-gray-100 text-[11px] font-black text-gray-600 uppercase tracking-widest shadow-sm">
                <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-black" /> Free shipping on ₹999+</span>
                <span className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-black" /> 15-day returns</span>
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-black" /> Official merch</span>
              </div>

              <hr className="my-8 border-gray-200" />
              
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <DetailAccordions details={product.details} />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
