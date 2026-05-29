'use client';

import { use } from 'react';
import { useStore } from '@/store/useStore';
import ProductDetailContent from '@/components/ProductDetailContent';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = useStore((s) => s.products.find((p) => p.id === id));

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">Product Not Found</p>
            <Link href="/men" className="text-[#FFE600] text-sm hover:underline">← Back to Men</Link>
          </div>
        </main>
      </>
    );
  }

  return <ProductDetailContent product={product} backHref="/men" backLabel="Men" />;
}
