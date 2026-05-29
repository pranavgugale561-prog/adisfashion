'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, getTotalStock } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Search, Edit3, Trash2 } from 'lucide-react';
import type { Product } from '@/types';

interface ProductTableProps {
  onEdit: (product: Product) => void;
}

export default function ProductTable({ onEdit }: ProductTableProps) {
  const { products, deleteProduct } = useStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.fandom_tag.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 border border-admin-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="overflow-x-auto border border-admin-border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-admin-border">
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Product
              </th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden md:table-cell">
                Fandom
              </th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                Base Price
              </th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:table-cell">
                Member Price
              </th>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Stock
              </th>
              <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const totalStock = getTotalStock(product.variants);
              return (
                <tr
                  key={product.id}
                  className="border-b border-admin-border hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-gray-100 rounded flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm truncate max-w-[180px]">
                          {product.title}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {product.fit_type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {product.fandom_tag}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="text-gray-400 line-through text-xs">
                      {formatCurrency(product.prices.base)}
                    </span>
                    <br />
                    <span className="font-semibold text-xs">
                      {formatCurrency(product.prices.sale)}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="font-semibold text-xs text-indigo-600">
                      {formatCurrency(product.prices.member)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-1 rounded',
                        totalStock === 0
                          ? 'bg-red-100 text-red-700'
                          : totalStock <= 20
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      )}
                    >
                      {totalStock === 0 ? 'OOS' : totalStock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${product.title}"? This cannot be undone.`
                            )
                          ) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            {search ? 'No products match your search.' : 'No products yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
