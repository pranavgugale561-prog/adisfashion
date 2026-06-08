'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';

// ─── Schema bridge ──────────────────────────────────────────────────────────
// The admin dashboard can save two flavours of products:
//  1. Rich  – the full frontend schema (id:string, prices:{base,sale,member}, variants[], …)
//  2. Simple – the legacy admin schema (id:number, price:string, image:string, …)
// We normalise whichever we get into the frontend Product type.

function normaliseProduct(raw: any, fallback: Product | undefined): Product | null {
  if (!raw) return null;

  // If the product already has the frontend's `prices` object — it's already rich
  if (raw.prices && typeof raw.prices === 'object') {
    return {
      ...raw,
      badges: raw.badges ?? fallback?.badges ?? [],
      images: raw.images ?? fallback?.images ?? ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'],
      variants: raw.variants ?? fallback?.variants ?? [
        { size: 'S', stock: 10 },
        { size: 'M', stock: 20 },
        { size: 'L', stock: 20 },
        { size: 'XL', stock: 10 },
      ],
      details: raw.details ?? fallback?.details ?? {
        material: raw.material ?? '100% Cotton',
        gsm: raw.gsm ?? '220 GSM',
        wash_care: raw.wash_care ?? 'Machine wash cold',
      },
    } as Product;
  }

  // ── Legacy "simple" admin product ──────────────────────────────────────
  // Try to derive a numeric price from strings like "₹999", "999", etc.
  const numericPrice = (() => {
    const raw_price = String(raw.price ?? '');
    const match = raw_price.replace(/[^0-9]/g, '');
    return match ? parseInt(match, 10) : 999;
  })();

  // Build an images array from whatever the admin sent
  const images: string[] = [];
  if (Array.isArray(raw.images)) images.push(...raw.images.filter(Boolean));
  else if (raw.image) images.push(raw.image);
  // Pad to 1 minimum
  if (images.length === 0) images.push('https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80');

  // Keep as much of the existing product as possible (so things like variants survive edits)
  return {
    id: String(raw.id),
    title: raw.title ?? 'Unnamed Product',
    category: raw.category ?? fallback?.category ?? 'Men',
    fit_type: raw.fit_type ?? fallback?.fit_type ?? 'Regular',
    fandom_tag: raw.fandom_tag ?? fallback?.fandom_tag ?? 'ADIS',
    badges: raw.badges ?? fallback?.badges ?? [],
    prices: {
      base:   raw.base_price   ?? fallback?.prices?.base   ?? numericPrice,
      sale:   raw.sale_price   ?? fallback?.prices?.sale   ?? Math.round(numericPrice * 0.75),
      member: raw.member_price ?? fallback?.prices?.member ?? Math.round(numericPrice * 0.6),
    },
    images,
    variants: raw.variants ?? fallback?.variants ?? [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 20 },
      { size: 'XL', stock: 10 },
    ],
    details: raw.details ?? fallback?.details ?? {
      material: raw.material ?? '100% Cotton',
      gsm: raw.gsm ?? '220 GSM',
      wash_care: raw.wash_care ?? 'Machine wash cold',
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const { products: storeProducts, setFirebaseProducts, setAppReady, setLandingConfig } = useStore();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const storeProductsRef = useRef(storeProducts);

  useEffect(() => {
    storeProductsRef.current = storeProducts;
  }, [storeProducts]);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      // Set a fallback timeout in case Firebase hangs (e.g. invalid DB URL)
      const fallbackTimeout = setTimeout(() => {
        if (!cancelled) {
          console.warn('[Firebase] Connection timeout, forcing app to load with mock data.');
          setAppReady(true);
        }
      }, 3000);

      try {
        const { getFirebaseDB } = await import('@/lib/firebase');
        const db = await getFirebaseDB();
        if (!db || cancelled) {
          clearTimeout(fallbackTimeout);

          // Fallback: Read from LocalStorage (from admin panel)
          try {
             const localProductsStr = localStorage.getItem('ADIS_products');
             let hasLocalProducts = false;
             
             if (localProductsStr) {
                const localProducts = JSON.parse(localProductsStr);
                if (Array.isArray(localProducts) && localProducts.length > 0) {
                   hasLocalProducts = true;
                   const normalised = localProducts.map((r: any) => {
                      const existing = storeProductsRef.current.find(p => String(p.id) === String(r?.id));
                      return normaliseProduct(r, existing);
                   }).filter((p): p is Product => p !== null);
                   if (normalised.length > 0) setFirebaseProducts(normalised);
                }
             } 
             
             if (!hasLocalProducts) {
                // Seed the Admin Panel with our current site products if it's empty
                localStorage.setItem('ADIS_products', JSON.stringify(storeProductsRef.current));
                
                // Extract categories from products and seed them too
                const cats = Array.from(new Set(storeProductsRef.current.map(p => p.category))).filter(Boolean);
                if (cats.length > 0) {
                   localStorage.setItem('ADIS_categories', JSON.stringify(cats));
                }
             }
             const localLandingStr = localStorage.getItem('ADIS_landingConfig');
             if (localLandingStr) {
                const localLanding = JSON.parse(localLandingStr);
                if (localLanding) setLandingConfig(localLanding);
             } else {
                // If the frontend store has a landingConfig already, or we have a default one, seed it.
                // We don't have storeLandingConfigRef easily accessible here, but the storefront uses a fallback if landingConfig is null.
                // Actually, the site uses defaults in Hero section if it's null.
                // Let's seed a basic landing config if missing so the admin panel has something to show.
                const defaultLanding = {
                   heroDesktop: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1600&q=80',
                   heroMobile: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
                   collection1: '',
                   collection2: '',
                   collection3: '',
                   collection4: ''
                };
                localStorage.setItem('ADIS_landingConfig', JSON.stringify(defaultLanding));
                setLandingConfig(defaultLanding);
             }
             
             // Listen for changes from the admin panel across tabs
             const handleStorage = (e: StorageEvent) => {
                 if (e.key === 'ADIS_products' && e.newValue) {
                     try {
                         const localProducts = JSON.parse(e.newValue);
                         if (Array.isArray(localProducts)) {
                             const normalised = localProducts.map((r: any) => {
                                 const existing = storeProductsRef.current.find(p => String(p.id) === String(r?.id));
                                 return normaliseProduct(r, existing);
                             }).filter((p): p is Product => p !== null);
                             if (normalised.length > 0) setFirebaseProducts(normalised);
                         }
                     } catch(err) {}
                 }
                 if (e.key === 'ADIS_landingConfig' && e.newValue) {
                     try {
                         const localLanding = JSON.parse(e.newValue);
                         if (localLanding) setLandingConfig(localLanding);
                     } catch(err) {}
                 }
             };
             window.addEventListener('storage', handleStorage);
             unsubscribeRef.current = () => window.removeEventListener('storage', handleStorage);
          } catch(e) {
             console.warn('LocalStorage fallback error:', e);
          }

          setAppReady(true);
          return;
        }

        const { ref, onValue } = await import('firebase/database');

        // ── 1. Listen to products ──────────────────────────────────────────
        const productsRef = ref(db, 'products');
        const unsubProducts = onValue(productsRef, (snapshot) => {
          clearTimeout(fallbackTimeout);
          const val = snapshot.val();
          if (!val) {
            // No products in Firebase yet — seed Firebase with mock data
            // But also load mock data into state so the app doesn't stay empty
            setFirebaseProducts(storeProductsRef.current);
            import('firebase/database').then(({ set }) => {
               set(productsRef, storeProductsRef.current).catch(err => {
                 console.warn('[Firebase] Seed failed (rules might be private). Using local mock data.');
               });
               const cats = Array.from(new Set(storeProductsRef.current.map(p => p.category))).filter(Boolean);
               if (cats.length > 0) {
                 set(ref(db, 'categories'), cats).catch(() => {});
               }
            });
            setAppReady(true);
            return;
          }

          const raw: any[] = Array.isArray(val) ? val : Object.values(val);

          // Normalise each raw product, preserving existing store data where possible
          const normalised: Product[] = raw
            .map((r: any) => {
              const existing = storeProductsRef.current.find(
                (p) => String(p.id) === String(r?.id)
              );
              return normaliseProduct(r, existing);
            })
            .filter((p): p is Product => p !== null);

          if (normalised.length > 0) {
            setFirebaseProducts(normalised);
          }
          setAppReady(true);
        }, (error) => {
          clearTimeout(fallbackTimeout);
          console.warn('[Firebase] products read error:', error);
          setAppReady(true);
        });

        // ── 2. Listen to landingConfig (hero banners) ─────────────────────
        const landingRef = ref(db, 'landingConfig');
        const unsubLanding = onValue(landingRef, (snapshot) => {
          const val = snapshot.val();
          if (val) {
             setLandingConfig(val);
          } else {
             const defaultLanding = {
               heroDesktop: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1600&q=80',
               heroMobile: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
               collection1: '', collection2: '', collection3: '', collection4: ''
             };
             import('firebase/database').then(({ set }) => {
                set(landingRef, defaultLanding);
             });
             setLandingConfig(defaultLanding);
          }
        });

        unsubscribeRef.current = () => {
          unsubProducts();
          unsubLanding();
        };
      } catch (err) {
        clearTimeout(fallbackTimeout);
        console.warn('[Firebase] Connection failed, using mock data:', err);
        setAppReady(true);
      }
    }

    connect();

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
