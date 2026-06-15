'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Variant } from '@/types';

interface SizeGridProps {
  variants: Variant[];
  selectedSize: string | null;
  onSelect: (size: string, inStock: boolean) => void;
}

export default function SizeGrid({ variants, selectedSize, onSelect }: SizeGridProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {variants.map((v) => {
          const inStock = v.stock > 0;
          const selected = selectedSize === v.size;
          return (
            <button
              key={v.size}
              aria-disabled={!inStock}
              onClick={() => {
                if (!inStock) {
                  setShowModal(true);
                } else {
                  onSelect(v.size, true);
                }
              }}
              className={cn(
                'w-[4.5rem] h-14 rounded-2xl text-sm font-black tracking-widest uppercase transition-all duration-300 relative group overflow-hidden border-2',
                selected
                  ? 'bg-black text-[#FFE600] border-black shadow-lg shadow-black/20 scale-105'
                  : inStock
                  ? 'bg-white text-gray-700 border-gray-200 hover:border-black hover:shadow-md'
                  : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              )}
            >
              <span className="relative z-10">{v.size}</span>
              {!inStock && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[1.5px] bg-gray-300 -rotate-45" />
              )}
              {inStock && !selected && (
                <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/20 z-50 text-center border border-white/50">
            <p className="text-xl font-black uppercase tracking-widest mb-3">Out of Stock</p>
            <p className="text-sm text-gray-500 mb-8 font-medium">
              This size is currently out of stock. Check back later or explore other sizes.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-black text-white px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300"
            >
              Got it
            </button>
          </div>
        </>
      )}
    </>
  );
}
