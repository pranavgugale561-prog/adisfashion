'use client';

import { useStore } from '@/store/useStore';
import type { Product } from '@/types';
import { ShoppingCart, Info, Tag, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardsProps {
  products: Product[];
  onProductClick?: (productId: string) => void;
}

export default function ProductCards({ products, onProductClick }: ProductCardsProps) {
  const { addToCart, isMember, cart } = useStore();

  if (!products || products.length === 0) return null;

  const handleAddToCart = (product: Product) => {
    // Add first available size
    const availableVariant = product.variants.find(v => v.stock > 0);
    if (!availableVariant) return;

    addToCart({
      productId: product.id,
      title: product.title,
      image: product.images[0],
      size: availableVariant.size,
      quantity: 1,
      price: isMember ? product.prices.member : product.prices.sale,
    });
  };

  const isInCart = (productId: string) => cart.some(c => c.productId === productId);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide w-full" style={{ scrollSnapType: 'x mandatory' }}>
      {products.map((product, i) => {
        const discount = Math.round(((product.prices.base - product.prices.sale) / product.prices.base) * 100);
        const price = isMember ? product.prices.member : product.prices.sale;
        const hasStock = product.variants.some(v => v.stock > 0);
        const inCart = isInCart(product.id);

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex-shrink-0 w-[160px] bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Image */}
            <div className="relative h-[120px] bg-gray-50 overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-1.5 left-1.5 bg-[#FFE600] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  -{discount}%
                </div>
              )}
              {/* Badges */}
              {product.badges.includes('NEW') && (
                <div className="absolute top-1.5 right-1.5 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  NEW
                </div>
              )}
              {!hasStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">Sold Out</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-2">
              <p className="text-[11px] font-semibold text-gray-900 leading-tight line-clamp-2 mb-1">
                {product.title}
              </p>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-sm font-black text-black">₹{price}</span>
                <span className="text-[9px] text-gray-400 line-through">₹{product.prices.base}</span>
              </div>

              {/* Fandom tag */}
              <div className="flex items-center gap-0.5 mb-2">
                <Tag size={8} className="text-gray-400" />
                <span className="text-[9px] text-gray-400">{product.fandom_tag}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!hasStock || inCart}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    inCart
                      ? 'bg-green-100 text-green-700'
                      : hasStock
                      ? 'bg-black text-white hover:bg-gray-800 active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={10} />
                  {inCart ? 'Added' : hasStock ? 'Add' : 'OOS'}
                </button>
                <button
                  onClick={() => onProductClick?.(product.id)}
                  className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Info size={10} className="text-gray-600" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
