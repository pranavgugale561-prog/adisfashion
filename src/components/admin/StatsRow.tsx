'use client';

import { useStore } from '@/store/useStore';
import { Package, AlertTriangle, Layers } from 'lucide-react';

export default function StatsRow() {
  const products = useStore((s) => s.products);

  const totalProducts = products.length;
  const outOfStock = products.filter((p) =>
    p.variants.every((v) => v.stock === 0)
  ).length;
  const lowStock = products.filter((p) =>
    p.variants.some((v) => v.stock > 0 && v.stock <= 5)
  ).length;
  const activeFandoms = [...new Set(products.map((p) => p.fandom_tag))].length;

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Out of Stock',
      value: outOfStock,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Low Stock Alert',
      value: lowStock,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Active Fandoms',
      value: activeFandoms,
      icon: Layers,
      color: 'text-green-600 bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-admin-border rounded-xl p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              {stat.label}
            </span>
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
