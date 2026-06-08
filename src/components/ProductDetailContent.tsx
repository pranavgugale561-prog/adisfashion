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
      <main className="flex-1 bg-transparent relative z-10 pb-28 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black font-semibold uppercase tracking-wider mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to {backLabel}
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex gap-3">
                <div className="hidden sm:flex flex-col gap-2">
                  {(product.images || []).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        'w-16 h-20 rounded-xl border-2 overflow-hidden transition-all duration-200',
                        selectedImage === i ? 'border-[#FFE600] scale-105' : 'border-gray-200 hover:border-gray-400'
                      )}
                    >
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="flex-1">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative shadow-xl"
                  >
                    <img src={product.images[selectedImage]} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                      {(product.badges || []).map((badge) => (
                        <span
                          key={badge}
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full',
                            badge === 'NEW' ? 'bg-[#FFE600] text-black' :
                            badge === 'BESTSELLER' ? 'bg-black text-white' :
                            'bg-white/80 text-black backdrop-blur-sm'
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

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-[#8B7700] font-bold uppercase tracking-wider">
                  {product.fandom_tag} / {product.fit_type}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold tracking-wider" title="Total Product Views">
                  <Eye className="w-3.5 h-3.5" />
                  {((Math.floor(product.id.length * 423.5) % 15000 + 3000) / 1000).toFixed(1)}k views
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider mb-4">{product.title}</h1>

              <PricingDisplay prices={product.prices} size="lg" />

              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                Premium quality {product.details.material.toLowerCase()} featuring exclusive {product.fandom_tag} design. Part of the official ADIS collection.
              </p>

              <hr className="my-6 border-gray-200" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider">Select Size</p>
                  {selectedSize && variant && (
                    <span className="text-xs text-green-600 font-semibold">
                      {variant.stock > 10 ? 'In Stock' : variant.stock > 0 ? `Only ${variant.stock} left` : 'Out of Stock'}
                    </span>
                  )}
                </div>
                <SizeGrid variants={product.variants || []} selectedSize={selectedSize} onSelect={(size) => setSelectedSize(size)} />
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className={cn(
                    'w-full py-3.5 rounded-full text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2',
                    selectedSize
                      ? addedToCart ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-900'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {addedToCart ? 'Added to Cart!' : selectedSize ? `Add to Cart — ${formatCurrency(effectivePrice)}` : 'Select a Size'}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={cn(
                      'flex-1 py-3 rounded-full text-sm font-semibold border-2 transition-all duration-200 flex items-center justify-center gap-2',
                      isWishlisted ? 'border-[#FFE600] text-[#FFE600] bg-red-50' : 'border-gray-200 hover:border-black'
                    )}
                  >
                    <Heart className={cn('w-4 h-4 transition-all', isWishlisted && 'fill-[#FFE600] text-[#FFE600]')} />
                    {isWishlisted ? 'Wishlisted ♥' : 'Wishlist'}
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
                    className="w-12 h-[52px] rounded-full text-sm font-semibold border-2 border-gray-200 hover:border-black transition-all duration-200 flex items-center justify-center"
                    aria-label="Share product"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  </button>
                </div>
              </div>

              <MembershipUpsell />

              <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Free shipping on ₹999+</span>
                <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4" /> 15-day returns</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Official merch</span>
              </div>

              <hr className="my-6 border-gray-200" />
              <DetailAccordions details={product.details} />
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
