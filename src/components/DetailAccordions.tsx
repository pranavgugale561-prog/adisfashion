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
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100/50">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Material</span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-900">{details.material}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100/50">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Fabric GSM</span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-900">{details.gsm}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100/50">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Fit Type</span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-900">Oversized</span>
          </div>
        </div>
      ),
    },
    {
      value: 'care',
      label: 'Care Instructions',
      content: (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed font-medium">{details.wash_care}</p>
        </div>
      ),
    },
    {
      value: 'exchange',
      label: 'Exchange & Returns',
      content: (
        <div className="space-y-3 text-xs text-gray-600 leading-relaxed font-medium p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="flex gap-2 items-start"><span className="text-black font-bold">1.</span> Easy 15-day return policy. Items must be unworn with tags attached.</p>
          <p className="flex gap-2 items-start"><span className="text-black font-bold">2.</span> Free size exchanges available on first purchase.</p>
          <p className="flex gap-2 items-start"><span className="text-black font-bold">3.</span> Refunds processed within 5-7 business days after inspection.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => {
        const isOpen = openItems.includes(item.value);
        return (
          <div key={item.value} className="group">
            <button
              onClick={() => toggle(item.value)}
              className="flex w-full items-center justify-between px-6 py-5 text-sm font-black uppercase tracking-widest hover:bg-gray-50/50 transition-colors"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 group-hover:from-black group-hover:to-black transition-all">
                {item.label}
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                    isOpen ? '-rotate-180 text-black' : ''
                  }`}
                />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
