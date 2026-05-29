'use client';

import { useStore } from '@/store/useStore';
import { X } from 'lucide-react';

export default function ActiveFilterChips() {
  const { filters, setFilters, resetFilters } = useStore();
  const chips: { label: string; onRemove: () => void }[] = [];

  filters.sizes.forEach((s) =>
    chips.push({
      label: `Size: ${s}`,
      onRemove: () =>
        setFilters({ sizes: filters.sizes.filter((v) => v !== s) }),
    })
  );

  filters.fits.forEach((f) =>
    chips.push({
      label: `Fit: ${f}`,
      onRemove: () =>
        setFilters({ fits: filters.fits.filter((v) => v !== f) }),
    })
  );

  filters.themes.forEach((t) =>
    chips.push({
      label: t,
      onRemove: () =>
        setFilters({ themes: filters.themes.filter((v) => v !== t) }),
    })
  );

  if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 3000) {
    chips.push({
      label: `₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}`,
      onRemove: () => setFilters({ priceRange: [0, 3000] }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1.5 bg-gray-100 text-xs font-medium px-3 py-1.5 rounded-full"
        >
          {chip.label}
          <button onClick={chip.onRemove} className="hover:text-gray-700">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={resetFilters}
        className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 ml-1"
      >
        Clear All
      </button>
    </div>
  );
}
