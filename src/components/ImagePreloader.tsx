'use client';

/**
 * ImagePreloader
 *
 * Silently preloads ALL site images into the browser cache while the user
 * is sitting on the "Tap to Start" loader screen.
 *
 * Strategy:
 *  1. As soon as landingConfig arrives from Firebase/localStorage, preload
 *     every Google Drive hero / banner / category image.
 *  2. Preload the first image of every product card (above-the-fold images).
 *  3. Use a low-priority fetch queue so we don't block the video or any
 *     critical resources — we load in small batches with a small delay
 *     between each so the browser stays responsive.
 *
 * This component renders nothing visible.
 */

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { parseImageLinks, convertGDriveUrl } from '@/utils/drive';

// How many images to preload in parallel at once
const BATCH_SIZE = 4;
// Delay between batches (ms) — keeps main thread free
const BATCH_DELAY_MS = 120;

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (!src) { resolve(); return; }
    const img = new window.Image();
    img.referrerPolicy = 'no-referrer';
    img.onload = () => resolve();
    img.onerror = () => resolve(); // silently swallow errors
    img.src = src;
  });
}

async function preloadBatch(urls: string[]) {
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(preloadImage));
    if (i + BATCH_SIZE < urls.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }
}

export default function ImagePreloader() {
  const { landingConfig, products } = useStore();
  const preloadedRef = useRef(false);

  useEffect(() => {
    // Only run once; wait until we have landingConfig
    if (preloadedRef.current) return;
    if (!landingConfig && (!products || products.length === 0)) return;

    preloadedRef.current = true;

    // ── 1. Collect all landing config image URLs ──────────────────────────────
    const landingUrls: string[] = [];

    if (landingConfig) {
      // Hero carousel images (desktop + mobile)
      parseImageLinks(landingConfig.heroDesktop).forEach((u) => landingUrls.push(u));
      parseImageLinks(landingConfig.heroMobile).forEach((u) => landingUrls.push(u));

      // Category banners, promo banners, any dynamic keys
      const bannerKeys = [
        'collection1', 'collection2', 'collection3', 'collection4',
        'latestDrop', 'dailyWear', 'sneakers', 'bestStore',
        'promoBanner1', 'promoBanner2',
      ];
      bannerKeys.forEach((key) => {
        if (landingConfig[key]) {
          const converted = convertGDriveUrl(landingConfig[key]);
          if (converted) landingUrls.push(converted);
        }
      });

      // Dynamic catBanner_* keys (admin-set per-category banners)
      Object.keys(landingConfig).forEach((key) => {
        if (key.startsWith('catBanner_') && landingConfig[key]) {
          const converted = convertGDriveUrl(landingConfig[key]);
          if (converted) landingUrls.push(converted);
        }
      });
    }

    // ── 2. Collect first product image for every product card ─────────────────
    const productUrls: string[] = [];
    if (products && products.length > 0) {
      products.forEach((p) => {
        if (p.images && p.images.length > 0) {
          // Preload first image (shown in card) + second image (hover)
          const first = convertGDriveUrl(p.images[0]);
          const second = p.images[1] ? convertGDriveUrl(p.images[1]) : null;
          if (first) productUrls.push(first);
          if (second) productUrls.push(second);
        }
      });
    }

    // ── 3. Deduplicate ────────────────────────────────────────────────────────
    const allUrls = Array.from(new Set([...landingUrls, ...productUrls])).filter(Boolean) as string[];

    if (allUrls.length === 0) return;

    console.log(`[ImagePreloader] Preloading ${allUrls.length} images in background...`);

    // ── 4. Fire-and-forget: preload without blocking anything ─────────────────
    // Use requestIdleCallback if available so we yield to the browser first
    const run = () => preloadBatch(allUrls).then(() => {
      console.log('[ImagePreloader] All images preloaded ✓');
    });

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(run, { timeout: 2000 });
    } else {
      // Fallback: small initial delay so we don't compete with the video load
      setTimeout(run, 300);
    }
  }, [landingConfig, products]);

  // Renders nothing — pure side-effect component
  return null;
}
