'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ImageIcon, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductFormProps {
  editingProduct: Product | null;
  open: boolean;
  onClose: () => void;
}

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
const categories = ['Men', 'Women', 'Unisex'];
const fits = ['Oversized', 'Regular', 'Slim'];
const fandoms = ['Marvel', 'Anime', 'DC', 'Rick & Morty'];
const badgeOptions = ['NEW', 'BESTSELLER'];

// ── Image slot definitions with recommended sizes ──────────────────────────
const IMAGE_SLOTS = [
  {
    label: 'Front View',
    key: 0,
    recommended: '800 × 1067 px',
    ratio: 'Portrait 3:4',
    tip: 'Main product shot — full garment on white/neutral background.',
    icon: '👕',
  },
  {
    label: 'Back View',
    key: 1,
    recommended: '800 × 1067 px',
    ratio: 'Portrait 3:4',
    tip: 'Back of the garment. Keep same lighting as front view.',
    icon: '🔄',
  },
  {
    label: 'Detail / Model Shot',
    key: 2,
    recommended: '800 × 1067 px',
    ratio: 'Portrait 3:4',
    tip: 'Close-up of print/design or model wearing the product.',
    icon: '🔍',
  },
];

const SITE_IMAGE_GUIDE = [
  { name: 'Hero Banner', size: '1440 × 600 px', ratio: '12:5 Landscape', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Category Card', size: '400 × 500 px', ratio: 'Portrait 4:5', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Trending Banner', size: '1200 × 500 px', ratio: '12:5 Landscape', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Product Image', size: '800 × 1067 px', ratio: 'Portrait 3:4', color: 'bg-green-50 text-green-700 border-green-200' },
];

const emptyForm = {
  title: '',
  category: 'Men',
  fit_type: 'Oversized',
  fandom_tag: 'Marvel',
  badges: [] as string[],
  basePrice: 1499,
  salePrice: 999,
  memberPrice: 799,
  variants: sizes.map((s) => ({ size: s, stock: 10 })),
  material: '',
  gsm: '',
  wash_care: '',
  images: ['', '', ''],
};

// ── Image URL input with live preview ─────────────────────────────────────
function ImageSlotInput({
  slot,
  value,
  onChange,
}: {
  slot: typeof IMAGE_SLOTS[0];
  value: string;
  onChange: (val: string) => void;
}) {
  const [showTip, setShowTip] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasValue = value.trim().length > 0;
  const isValid = hasValue && !imgError;

  return (
    <div className="border border-admin-border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Slot header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-admin-border">
        <div className="flex items-center gap-2">
          <span className="text-base">{slot.icon}</span>
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{slot.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasValue && (
            isValid
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              : <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          )}
          <button
            type="button"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            className="relative text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            {showTip && (
              <div className="absolute right-0 top-5 z-50 w-52 bg-gray-900 text-white text-[11px] rounded-lg p-2.5 leading-relaxed shadow-xl">
                {slot.tip}
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-3 p-3">
        {/* Live preview thumbnail */}
        <div className="w-20 h-[106px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
          {hasValue && !imgError ? (
            <img
              src={value}
              alt={slot.label}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              onLoad={() => setImgError(false)}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-300">
              <ImageIcon className="w-6 h-6" />
              <span className="text-[9px] font-medium text-center leading-tight">No preview</span>
            </div>
          )}
        </div>

        {/* URL input + size guide */}
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="url"
            value={value}
            onChange={(e) => { setImgError(false); onChange(e.target.value); }}
            placeholder="Paste image URL (https://...)"
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 transition-colors',
              imgError && hasValue
                ? 'border-red-300 focus:ring-red-300 bg-red-50'
                : 'border-admin-border focus:ring-[#FFE600]/30 focus:border-[#FFE600]'
            )}
          />
          {/* Recommended size badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-[#FFE600] border border-red-200 rounded-full text-[10px] font-bold">
              📐 {slot.recommended}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-medium">
              {slot.ratio}
            </span>
          </div>
          {imgError && hasValue && (
            <p className="text-[10px] text-red-500 font-medium">⚠ URL could not be loaded. Check the link.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Site-wide image size reference (collapsible) ───────────────────────────
function SiteImageGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-dashed border-gray-300 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#FFE600]" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Site-wide Image Size Reference
          </span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">{open ? 'Hide ▲' : 'Show ▼'}</span>
      </button>
      {open && (
        <div className="p-3 grid grid-cols-2 gap-2 bg-white">
          {SITE_IMAGE_GUIDE.map((g) => (
            <div key={g.name} className={cn('rounded-lg border px-3 py-2', g.color)}>
              <p className="text-[11px] font-bold mb-0.5">{g.name}</p>
              <p className="text-[11px] font-mono font-semibold">{g.size}</p>
              <p className="text-[10px] opacity-70">{g.ratio}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ProductForm ───────────────────────────────────────────────────────
export default function ProductForm({ editingProduct, open, onClose }: ProductFormProps) {
  const { addProduct, updateProduct } = useStore();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        title: editingProduct.title,
        category: editingProduct.category,
        fit_type: editingProduct.fit_type,
        fandom_tag: editingProduct.fandom_tag,
        badges: editingProduct.badges,
        basePrice: editingProduct.prices.base,
        salePrice: editingProduct.prices.sale,
        memberPrice: editingProduct.prices.member,
        variants: sizes.map((s) => {
          const existing = editingProduct.variants.find((v) => v.size === s);
          return { size: s, stock: existing ? existing.stock : 0 };
        }),
        material: editingProduct.details.material,
        gsm: editingProduct.details.gsm,
        wash_care: editingProduct.details.wash_care,
        images: [
          editingProduct.images[0] || '',
          editingProduct.images[1] || '',
          editingProduct.images[2] || '',
        ],
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingProduct, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingProduct?.id || form.title.toLowerCase().replace(/\s+/g, '-');

    const fallback = '/images/hero_banner_men_1779127853971.png';
    const product: Product = {
      id,
      title: form.title,
      category: form.category,
      fit_type: form.fit_type,
      fandom_tag: form.fandom_tag,
      badges: form.badges,
      prices: {
        base: form.basePrice,
        sale: form.salePrice,
        member: form.memberPrice,
      },
      images: form.images.some(Boolean)
        ? form.images.map((img) => img || fallback)
        : [fallback],
      variants: form.variants,
      details: {
        material: form.material,
        gsm: form.gsm,
        wash_care: form.wash_care,
      },
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, product);
    } else {
      addProduct(product);
    }
    onClose();
  };

  const toggleBadge = (badge: string) => {
    setForm((prev) => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter((b) => b !== badge)
        : [...prev.badges, badge],
    }));
  };

  const updateVariantStock = (size: string, stock: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.size === size ? { ...v, stock: Math.max(0, stock) } : v
      ),
    }));
  };

  const updateImage = (index: number, url: string) => {
    setForm((prev) => {
      const imgs = [...prev.images];
      imgs[index] = url;
      return { ...prev, images: imgs };
    });
  };

  const inputCls = 'w-full px-3 py-2 border border-admin-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE600]/30 focus:border-[#FFE600] transition-colors';
  const sectionTitle = 'text-xs font-bold uppercase tracking-wider text-gray-500 mb-3';

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50 p-0">

          {/* ── Header ── */}
          <div className="sticky top-0 bg-white border-b border-admin-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <Dialog.Title className="text-lg font-bold uppercase tracking-wider">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Dialog.Title>
            <Dialog.Close className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-7">

            {/* ── Core Information ── */}
            <div>
              <h3 className={sectionTitle}>Core Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Product Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className={inputCls}
                    placeholder="e.g. Marvel Logo Oversized Tee"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Fit Type</label>
                  <select value={form.fit_type} onChange={(e) => setForm({ ...form, fit_type: e.target.value })} className={inputCls}>
                    {fits.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Fandom Tag</label>
                  <select value={form.fandom_tag} onChange={(e) => setForm({ ...form, fandom_tag: e.target.value })} className={inputCls}>
                    {fandoms.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Badges</label>
                  <div className="flex gap-2">
                    {badgeOptions.map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => toggleBadge(badge)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                          form.badges.includes(badge)
                            ? badge === 'NEW'
                              ? 'bg-[#FFE600] text-black border-[#FFE600] scale-105'
                              : 'bg-black text-white border-black scale-105'
                            : 'border-gray-300 text-gray-500 hover:border-gray-500'
                        )}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Product Images ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={sectionTitle + ' mb-0'}>Product Images</h3>
                <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">3 slots · 3:4 ratio</span>
              </div>

              {/* Collapsible site-wide guide */}
              <div className="mb-3">
                <SiteImageGuide />
              </div>

              {/* Per-slot image inputs */}
              <div className="space-y-3">
                {IMAGE_SLOTS.map((slot) => (
                  <ImageSlotInput
                    key={slot.key}
                    slot={slot}
                    value={form.images[slot.key]}
                    onChange={(url) => updateImage(slot.key, url)}
                  />
                ))}
              </div>

              {/* Global tips */}
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">💡</span>
                <div className="text-[11px] text-amber-800 leading-relaxed space-y-1">
                  <p><strong>Best practices:</strong> Use images with a white or light background for consistency.</p>
                  <p>Format: <strong>WebP or JPEG</strong> · Max size: <strong>300 KB</strong> per image · Min resolution: <strong>600 × 800 px</strong></p>
                  <p>All 3 images should match in <strong>lighting, style, and crop</strong>.</p>
                </div>
              </div>
            </div>

            {/* ── Pricing ── */}
            <div>
              <h3 className={sectionTitle}>Pricing (₹)</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Base Price', key: 'basePrice' as const },
                  { label: 'Sale Price', key: 'salePrice' as const },
                  { label: 'Member Price', key: 'memberPrice' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
                    <input type="number" value={form[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} min={0} className={inputCls} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Variant Stock ── */}
            <div>
              <h3 className={sectionTitle}>Variant Stock</h3>
              <div className="grid grid-cols-5 gap-3">
                {form.variants.map((v) => (
                  <div key={v.size} className="text-center">
                    <label className="text-xs font-bold text-gray-600 mb-1 block">{v.size}</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateVariantStock(v.size, Number(e.target.value))}
                      min={0}
                      className="w-full px-2 py-2 border border-admin-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#FFE600]/30 focus:border-[#FFE600]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Product Specs ── */}
            <div>
              <h3 className={sectionTitle}>Product Specs</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Material</label>
                  <input type="text" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className={inputCls} placeholder="e.g. 100% Organic Cotton" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">GSM</label>
                  <input type="text" value={form.gsm} onChange={(e) => setForm({ ...form, gsm: e.target.value })} className={inputCls} placeholder="e.g. 240 GSM" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Wash Care Instructions</label>
                  <textarea value={form.wash_care} onChange={(e) => setForm({ ...form, wash_care: e.target.value })} rows={2} className={inputCls + ' resize-none'} placeholder="e.g. Machine wash cold, tumble dry low" />
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3 pt-4 border-t border-admin-border">
              <Dialog.Close asChild>
                <button type="button" className="px-6 py-2.5 border-2 border-gray-200 rounded-full text-sm font-semibold hover:border-gray-400 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button type="submit" className="px-6 py-2.5 bg-[#FFE600] text-black rounded-full text-sm font-bold hover:bg-[#D4BF00] transition-colors shadow-sm">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
