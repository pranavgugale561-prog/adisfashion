'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductDetails } from '@/types';

interface DetailAccordionsProps {
  details: ProductDetails;
}

export default function DetailAccordions({ details }: DetailAccordionsProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (value: string) => {
    setOpenItems((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const items = [
    {
      value: 'specs',
      label: 'Product Specifications',
      content: (
        <div className="space-y-2">
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-xs text-gray-500">Material</span>
            <span className="text-xs font-semibold">{details.material}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-xs text-gray-500">Fabric GSM</span>
            <span className="text-xs font-semibold">{details.gsm}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-xs text-gray-500">Fit Type</span>
            <span className="text-xs font-semibold">Oversized</span>
          </div>
        </div>
      ),
    },
    {
      value: 'care',
      label: 'Care Instructions',
      content: <p className="text-xs text-gray-600 leading-relaxed">{details.wash_care}</p>,
    },
    {
      value: 'exchange',
      label: 'Exchange & Returns',
      content: (
        <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
          <p>Easy 15-day return policy. Items must be unworn with tags attached.</p>
          <p>Free size exchanges available on first purchase.</p>
          <p>Refunds processed within 5-7 business days after inspection.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isOpen = openItems.includes(item.value);
        return (
          <div key={item.value}>
            <button
              onClick={() => toggle(item.value)}
              className="flex w-full items-center justify-between py-3.5 text-sm font-bold uppercase tracking-wider border-b border-gray-200 hover:text-indigo-600 transition-colors"
            >
              {item.label}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="py-4">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
