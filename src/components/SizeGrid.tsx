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
      <div className="flex flex-wrap gap-2">
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
                'w-14 h-12 rounded-lg text-sm font-semibold border transition-colors relative',
                selected
                  ? 'bg-black text-white border-black'
                  : inStock
                  ? 'border-gray-300 hover:border-gray-500'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              )}
            >
              {v.size}
              {!inStock && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-0.5 bg-gray-300 rotate-45" />
              )}
            </button>
          );
        })}
      </div>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-2xl p-6 shadow-2xl z-50 text-center">
            <p className="text-lg font-bold mb-2">Out of Stock</p>
            <p className="text-sm text-gray-500 mb-6">
              This size is currently out of stock. Check back later or explore other sizes.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-900 transition-colors"
            >
              Got it
            </button>
          </div>
        </>
      )}
    </>
  );
}
