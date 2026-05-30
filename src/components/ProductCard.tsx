'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

function categoryHref(product: Product) {
  if (product.category === 'Daily Wear') return `/daily-wear/${product.id}`;
  if (product.category === 'Sneakers') return `/sneakers/${product.id}`;
  return `/men/${product.id}`;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [showSizes, setShowSizes] = useState(false);
  const { wishlist, toggleWishlist, addToCart, setCartOpen, isMember } = useStore();
  const isWishlisted = wishlist.includes(product.id);
  const totalStock = (product.variants || []).reduce((a, v) => a + v.stock, 0);
  const memberPrice = isMember;
  const href = categoryHref(product);
  const impressions = Math.floor(product.id.length * 423.5) % 15000 + 3000;
  const formattedImpressions = (impressions / 1000).toFixed(1) + 'k';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group"
    >
      <Link href={href} className="block">
        <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-3 shadow-md">
          <img
            src={product.images?.[0] || '/images/hero_banner_men_1779127853971.png'}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {(product.badges || []).map((badge) => (
              <span
                key={badge}
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full',
                  badge === 'NEW'
                    ? 'bg-[#FFE600] text-black'
                    : badge === 'BESTSELLER'
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                )}
              >
                {badge}
              </span>
            ))}
          </div>

          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-bold uppercase tracking-wider">Out of Stock</span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm z-10"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                isWishlisted ? 'fill-[#FFE600] text-[#FFE600]' : 'text-gray-600'
              )}
            />
          </button>

          {/* Quick Add Button */}
          {totalStock > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSizes(true);
              }}
              className="absolute bottom-3 right-3 p-2 bg-black/80 backdrop-blur-sm text-white rounded-full hover:bg-black transition-transform hover:scale-105 shadow-md z-10"
              aria-label="Quick add"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}

          {/* Quick Add Size Overlay */}
          {showSizes && (
            <div 
              className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <button 
                onClick={(e) => { e.preventDefault(); setShowSizes(false); }}
                className="absolute top-3 right-3 p-2 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <p className="text-white text-xs font-bold uppercase tracking-widest mb-4">Select Size</p>
              <div className="flex flex-wrap justify-center gap-2">
                {(product.variants || []).map((v) => (
                  <button
                    key={v.size}
                    disabled={v.stock === 0}
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({
                        productId: product.id,
                        title: product.title,
                        image: product.images[0],
                        size: v.size,
                        quantity: 1,
                        price: memberPrice ? product.prices.member : product.prices.sale,
                      });
                      setShowSizes(false);
                      setCartOpen(true);
                    }}
                    className={cn(
                      'w-10 h-10 rounded-lg text-xs font-bold border transition-colors relative',
                      v.stock > 0 
                        ? 'border-white/30 text-white hover:bg-[#FFE600] hover:text-black hover:border-[#FFE600]' 
                        : 'border-white/10 text-white/30 cursor-not-allowed bg-black/50'
                    )}
                  >
                    {v.size}
                    {v.stock === 0 && (
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[1px] bg-white/30 -rotate-45" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="text-white text-xs font-semibold uppercase tracking-wider">
              Quick View →
            </span>
          </div>
        </div>
      </Link>

      <div className="px-1">
        <div className="flex justify-between items-center mb-0.5">
          <p className="text-xs text-[#8B7700] font-bold uppercase tracking-wider">
            {product.fandom_tag}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold tracking-wider" title="Total Product Impressions">
            <Eye className="w-3 h-3" />
            {formattedImpressions} views
          </div>
        </div>
        <Link href={href}>
          <h3 className="text-sm font-semibold leading-tight hover:text-[#8B7700] transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-bold text-[15px]">
            {formatCurrency(product.prices.sale)}
          </span>
          <span className="text-gray-400 text-xs line-through font-medium">
            {formatCurrency(product.prices.base)}
          </span>
        </div>
        {memberPrice && (
          <span className="inline-block mt-1 text-[10px] font-bold text-white bg-[#FFE600] px-2 py-0.5 rounded uppercase tracking-wider">
            Member: {formatCurrency(product.prices.member)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
