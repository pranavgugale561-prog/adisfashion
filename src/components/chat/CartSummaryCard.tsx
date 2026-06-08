'use client';

import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CartItem, Product } from '@/types';
import { useStore } from '@/store/useStore';

interface CartSummaryProps {
  cart: CartItem[];
  products: Product[];
  onCheckout?: () => void;
}

export default function CartSummaryCard({ cart, products, onCheckout }: CartSummaryProps) {
  const { removeFromCart, isMember } = useStore();

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    const price = product
      ? (isMember ? product.prices.member : product.prices.sale)
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  const savings = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return sum;
    const baseCost = product.prices.base * item.quantity;
    const saleCost = (isMember ? product.prices.member : product.prices.sale) * item.quantity;
    return sum + (baseCost - saleCost);
  }, 0);

  const freeShipping = subtotal >= 999;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden w-full"
    >
      {/* Header */}
      <div className="bg-black px-3 py-2.5 flex items-center gap-2">
        <ShoppingBag size={14} className="text-[#FFE600]" />
        <span className="text-white text-xs font-bold">Your Cart ({cart.length} items)</span>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-50 max-h-[200px] overflow-y-auto">
        {cart.map((item, i) => {
          const product = products.find(p => p.id === item.productId);
          const price = product
            ? (isMember ? product.prices.member : product.prices.sale)
            : item.price;

          return (
            <div key={`${item.productId}-${item.size}`} className="flex items-center gap-2 px-3 py-2">
              {/* Image */}
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-900 truncate">{item.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">
                    {item.size}
                  </span>
                  <span className="text-[9px] text-gray-400">×{item.quantity}</span>
                </div>
              </div>

              {/* Price + Remove */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs font-black text-black">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                <button
                  onClick={() => removeFromCart(item.productId, item.size)}
                  className="w-5 h-5 bg-red-50 hover:bg-red-100 rounded flex items-center justify-center transition-colors"
                >
                  <Trash2 size={9} className="text-red-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3 py-2.5 space-y-1.5">
        {/* Shipping progress */}
        <div>
          {freeShipping ? (
            <p className="text-[10px] text-green-600 font-semibold">✅ Free shipping applied!</p>
          ) : (
            <div>
              <p className="text-[10px] text-gray-500 mb-1">
                Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free shipping
              </p>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFE600] rounded-full transition-all"
                  style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-400">Subtotal</p>
            {savings > 0 && (
              <p className="text-[9px] text-green-600 font-semibold">You save ₹{savings.toLocaleString('en-IN')}!</p>
            )}
          </div>
          <span className="text-sm font-black text-black">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>

        {/* Checkout button */}
        <button
          onClick={onCheckout}
          className="w-full bg-black text-[#FFE600] text-xs font-black py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:bg-gray-900 active:scale-[0.98] transition-all"
        >
          Proceed to Checkout
          <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}
