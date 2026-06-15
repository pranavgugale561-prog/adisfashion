'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem, FilterState, User } from '@/types';

export interface Lead {
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  visitorId?: string;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'marvel-logo-tee',
    title: 'Marvel Logo Oversized Tee',
    category: 'Men',
    fit_type: 'Oversized',
    fandom_tag: 'Marvel',
    badges: ['NEW', 'BESTSELLER'],
    prices: { base: 1499, sale: 999, member: 799 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 15 },
      { size: 'M', stock: 42 },
      { size: 'L', stock: 38 },
      { size: 'XL', stock: 20 },
      { size: 'XXL', stock: 8 },
    ],
    details: { material: '100% Organic Cotton', gsm: '240 GSM', wash_care: 'Machine wash cold, tumble dry low' },
  },
  {
    id: 'naruto-shadow-tee',
    title: 'Naruto Shadow Oversized Tee',
    category: 'Men',
    fit_type: 'Oversized',
    fandom_tag: 'Anime',
    badges: ['BESTSELLER'],
    prices: { base: 1299, sale: 899, member: 699 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 0 },
      { size: 'M', stock: 25 },
      { size: 'L', stock: 45 },
      { size: 'XL', stock: 30 },
      { size: 'XXL', stock: 12 },
    ],
    details: { material: '100% Cotton', gsm: '220 GSM', wash_care: 'Machine wash cold, do not bleach' },
  },
  {
    id: 'batman-dark-knight',
    title: 'Batman Dark Knight Tee',
    category: 'Men',
    fit_type: 'Oversized',
    fandom_tag: 'DC',
    badges: ['NEW'],
    prices: { base: 1599, sale: 1099, member: 899 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 35 },
      { size: 'L', stock: 40 },
      { size: 'XL', stock: 0 },
      { size: 'XXL', stock: 5 },
    ],
    details: { material: 'Premium Cotton Blend', gsm: '260 GSM', wash_care: 'Machine wash cold, hang dry' },
  },
  {
    id: 'rick-morty-portal',
    title: 'Rick & Morty Portal Tee',
    category: 'Men',
    fit_type: 'Regular',
    fandom_tag: 'Rick & Morty',
    badges: [],
    prices: { base: 1199, sale: 799, member: 599 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 22 },
      { size: 'M', stock: 48 },
      { size: 'L', stock: 55 },
      { size: 'XL', stock: 33 },
      { size: 'XXL', stock: 18 },
    ],
    details: { material: '100% Cotton', gsm: '200 GSM', wash_care: 'Machine wash cold, tumble dry low' },
  },
  {
    id: 'avengers-endgame',
    title: 'Avengers Endgame Tee',
    category: 'Men',
    fit_type: 'Regular',
    fandom_tag: 'Marvel',
    badges: ['BESTSELLER'],
    prices: { base: 1399, sale: 949, member: 749 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 28 },
      { size: 'L', stock: 50 },
      { size: 'XL', stock: 18 },
      { size: 'XXL', stock: 0 },
    ],
    details: { material: 'Cotton Polyester Blend', gsm: '230 GSM', wash_care: 'Machine wash cold, do not iron print' },
  },
  {
    id: 'dbz-kamehameha',
    title: 'Dragon Ball Z Kamehameha Tee',
    category: 'Men',
    fit_type: 'Oversized',
    fandom_tag: 'Anime',
    badges: ['NEW'],
    prices: { base: 1349, sale: 949, member: 749 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 12 },
      { size: 'M', stock: 30 },
      { size: 'L', stock: 42 },
      { size: 'XL', stock: 0 },
      { size: 'XXL', stock: 7 },
    ],
    details: { material: '100% Cotton', gsm: '240 GSM', wash_care: 'Machine wash cold, tumble dry low' },
  },
  {
    id: 'superman-legacy',
    title: 'Superman Legacy Tee',
    category: 'Men',
    fit_type: 'Regular',
    fandom_tag: 'DC',
    badges: [],
    prices: { base: 1449, sale: 999, member: 799 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 18 },
      { size: 'M', stock: 36 },
      { size: 'L', stock: 44 },
      { size: 'XL', stock: 22 },
      { size: 'XXL', stock: 10 },
    ],
    details: { material: 'Premium Cotton Blend', gsm: '220 GSM', wash_care: 'Machine wash cold, hang dry' },
  },
  {
    id: 'aot-scouts',
    title: 'Attack on Titan Scouts Tee',
    category: 'Men',
    fit_type: 'Oversized',
    fandom_tag: 'Anime',
    badges: ['BESTSELLER', 'NEW'],
    prices: { base: 1399, sale: 949, member: 749 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 0 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 38 },
      { size: 'XL', stock: 28 },
      { size: 'XXL', stock: 0 },
    ],
    details: { material: '100% Organic Cotton', gsm: '250 GSM', wash_care: 'Machine wash cold, do not bleach' },
  },
  {
    id: 'spiderman-across',
    title: 'Spider-Man Across The Verse Tee',
    category: 'Men',
    fit_type: 'Oversized',
    fandom_tag: 'Marvel',
    badges: ['NEW'],
    prices: { base: 1549, sale: 1049, member: 849 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 22 },
      { size: 'L', stock: 35 },
      { size: 'XL', stock: 14 },
      { size: 'XXL', stock: 0 },
    ],
    details: { material: 'Cotton Polyester Blend', gsm: '230 GSM', wash_care: 'Machine wash cold, tumble dry low' },
  },
  {
    id: 'joker-dark-knight',
    title: 'Joker Dark Night Tee',
    category: 'Men',
    fit_type: 'Oversized',
    fandom_tag: 'DC',
    badges: [],
    prices: { base: 1299, sale: 899, member: 699 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 20 },
      { size: 'M', stock: 40 },
      { size: 'L', stock: 48 },
      { size: 'XL', stock: 26 },
      { size: 'XXL', stock: 15 },
    ],
    details: { material: '100% Cotton', gsm: '200 GSM', wash_care: 'Machine wash cold, tumble dry low' },
  },
  {
    id: 'one-piece-straw-hat',
    title: 'One Piece Straw Hat Tee',
    category: 'Men',
    fit_type: 'Regular',
    fandom_tag: 'Anime',
    badges: ['BESTSELLER'],
    prices: { base: 1249, sale: 849, member: 649 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 14 },
      { size: 'M', stock: 32 },
      { size: 'L', stock: 46 },
      { size: 'XL', stock: 24 },
      { size: 'XXL', stock: 6 },
    ],
    details: { material: '100% Cotton', gsm: '210 GSM', wash_care: 'Machine wash cold, hang dry' },
  },
  {
    id: 'pickle-rick',
    title: 'Pickle Rick Classic Tee',
    category: 'Men',
    fit_type: 'Regular',
    fandom_tag: 'Rick & Morty',
    badges: ['NEW'],
    prices: { base: 1149, sale: 749, member: 549 },
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
    variants: [
      { size: 'S', stock: 25 },
      { size: 'M', stock: 50 },
      { size: 'L', stock: 60 },
      { size: 'XL', stock: 35 },
      { size: 'XXL', stock: 20 },
    ],
    details: { material: '100% Cotton', gsm: '200 GSM', wash_care: 'Machine wash cold, tumble dry low' },
  },
  // ── Daily Wear ──────────────────────────────────────────────────────────
  { id: 'dw-classic-white', title: 'Classic White Essential Tee', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Essentials', badges: ['NEW'], prices: { base: 899, sale: 599, member: 499 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 30 }, { size: 'M', stock: 50 }, { size: 'L', stock: 45 }, { size: 'XL', stock: 20 }, { size: 'XXL', stock: 10 }], details: { material: '100% Cotton', gsm: '180 GSM', wash_care: 'Machine wash cold' } },
  { id: 'dw-black-minimal', title: 'Black Minimal Oversized Tee', category: 'Daily Wear', fit_type: 'Oversized', fandom_tag: 'Essentials', badges: ['BESTSELLER'], prices: { base: 999, sale: 699, member: 549 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 25 }, { size: 'M', stock: 40 }, { size: 'L', stock: 38 }, { size: 'XL', stock: 15 }, { size: 'XXL', stock: 8 }], details: { material: '100% Premium Cotton', gsm: '200 GSM', wash_care: 'Machine wash cold, tumble dry low' } },
  { id: 'dw-grey-cargo', title: 'Urban Grey Cargo Shorts', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: [], prices: { base: 1499, sale: 999, member: 799 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 15 }, { size: 'M', stock: 28 }, { size: 'L', stock: 35 }, { size: 'XL', stock: 20 }, { size: 'XXL', stock: 5 }], details: { material: 'Cotton Twill', gsm: '260 GSM', wash_care: 'Machine wash cold, hang dry' } },
  { id: 'dw-navy-hoodie', title: 'Navy Essential Hoodie', category: 'Daily Wear', fit_type: 'Oversized', fandom_tag: 'Essentials', badges: ['NEW', 'BESTSELLER'], prices: { base: 1999, sale: 1399, member: 1199 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 12 }, { size: 'M', stock: 22 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 18 }, { size: 'XXL', stock: 6 }], details: { material: '80% Cotton 20% Polyester', gsm: '320 GSM', wash_care: 'Machine wash cold, hang dry' } },
  { id: 'dw-track-pants', title: 'ADIS Track Pants', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: [], prices: { base: 1299, sale: 899, member: 699 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 20 }, { size: 'M', stock: 35 }, { size: 'L', stock: 40 }, { size: 'XL', stock: 25 }, { size: 'XXL', stock: 10 }], details: { material: 'Polyester Blend', gsm: '240 GSM', wash_care: 'Machine wash cold' } },
  { id: 'dw-white-jogger', title: 'White Slim Jogger', category: 'Daily Wear', fit_type: 'Slim', fandom_tag: 'Essentials', badges: ['NEW'], prices: { base: 1199, sale: 849, member: 699 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 18 }, { size: 'M', stock: 30 }, { size: 'L', stock: 32 }, { size: 'XL', stock: 14 }, { size: 'XXL', stock: 4 }], details: { material: 'Cotton Spandex', gsm: '220 GSM', wash_care: 'Machine wash cold, tumble dry low' } },
  { id: 'dw-polo-red', title: 'ADIS Polo Classic Red', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Essentials', badges: ['BESTSELLER'], prices: { base: 1099, sale: 799, member: 649 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 22 }, { size: 'M', stock: 38 }, { size: 'L', stock: 42 }, { size: 'XL', stock: 20 }, { size: 'XXL', stock: 8 }], details: { material: 'Pique Cotton', gsm: '200 GSM', wash_care: 'Machine wash cold' } },
  { id: 'dw-bomber-black', title: 'Black Bomber Jacket', category: 'Daily Wear', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: ['NEW'], prices: { base: 2999, sale: 1999, member: 1699 }, images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=800&q=80', 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80'], variants: [{ size: 'S', stock: 8 }, { size: 'M', stock: 15 }, { size: 'L', stock: 20 }, { size: 'XL', stock: 10 }, { size: 'XXL', stock: 3 }], details: { material: 'Polyester Shell, Cotton Lining', gsm: '300 GSM', wash_care: 'Dry clean only' } },
  // ── Sneakers ─────────────────────────────────────────────────────────────
  { id: 'snk-air-white', title: 'ADIS Air Classic White', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Originals', badges: ['NEW', 'BESTSELLER'], prices: { base: 3999, sale: 2999, member: 2499 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 5 }, { size: 'M', stock: 12 }, { size: 'L', stock: 18 }, { size: 'XL', stock: 8 }, { size: 'XXL', stock: 3 }], details: { material: 'Leather Upper, Rubber Sole', gsm: 'N/A', wash_care: 'Wipe clean with damp cloth' } },
  { id: 'snk-runner-black', title: 'ADIS Runner Pro Black', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Performance', badges: ['NEW'], prices: { base: 4499, sale: 3299, member: 2799 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 8 }, { size: 'M', stock: 15 }, { size: 'L', stock: 20 }, { size: 'XL', stock: 10 }, { size: 'XXL', stock: 4 }], details: { material: 'Mesh Upper, EVA Sole', gsm: 'N/A', wash_care: 'Spot clean only' } },
  { id: 'snk-street-red', title: 'ADIS Street Fire Red', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: ['BESTSELLER'], prices: { base: 3499, sale: 2699, member: 2299 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 6 }, { size: 'M', stock: 14 }, { size: 'L', stock: 16 }, { size: 'XL', stock: 9 }, { size: 'XXL', stock: 2 }], details: { material: 'Suede Upper, Gum Sole', gsm: 'N/A', wash_care: 'Wipe clean, use suede brush' } },
  { id: 'snk-slip-on', title: 'ADIS Slip-On Minimal', category: 'Sneakers', fit_type: 'Slim', fandom_tag: 'Originals', badges: [], prices: { base: 2499, sale: 1799, member: 1499 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 15 }, { size: 'M', stock: 22 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 12 }, { size: 'XXL', stock: 5 }], details: { material: 'Canvas Upper, Vulcanized Sole', gsm: 'N/A', wash_care: 'Machine wash cold, air dry' } },
  { id: 'snk-hi-top-grey', title: 'ADIS Hi-Top Grey Stone', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Streetwear', badges: ['NEW'], prices: { base: 3999, sale: 2999, member: 2499 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 4 }, { size: 'M', stock: 10 }, { size: 'L', stock: 14 }, { size: 'XL', stock: 7 }, { size: 'XXL', stock: 2 }], details: { material: 'Leather & Canvas, Rubber Sole', gsm: 'N/A', wash_care: 'Spot clean only' } },
  { id: 'snk-collab-marvel', title: 'ADIS × Marvel Spidey Force', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Marvel', badges: ['NEW', 'BESTSELLER'], prices: { base: 4999, sale: 3799, member: 3299 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 3 }, { size: 'M', stock: 8 }, { size: 'L', stock: 10 }, { size: 'XL', stock: 5 }, { size: 'XXL', stock: 1 }], details: { material: 'Limited Edition Fabric Upper', gsm: 'N/A', wash_care: 'Spot clean only, store in box' } },
  { id: 'snk-foam-slide', title: 'ADIS Foam Slide Sandal', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Originals', badges: [], prices: { base: 1499, sale: 999, member: 799 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 20 }, { size: 'M', stock: 35 }, { size: 'L', stock: 40 }, { size: 'XL', stock: 18 }, { size: 'XXL', stock: 8 }], details: { material: 'EVA Foam', gsm: 'N/A', wash_care: 'Rinse with water' } },
  { id: 'snk-boot-tan', title: 'ADIS Trail Boot Tan', category: 'Sneakers', fit_type: 'Regular', fandom_tag: 'Originals', badges: ['NEW'], prices: { base: 5499, sale: 3999, member: 3499 }, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80'], variants: [{ size: 'S', stock: 4 }, { size: 'M', stock: 9 }, { size: 'L', stock: 12 }, { size: 'XL', stock: 6 }, { size: 'XXL', stock: 2 }], details: { material: 'Full Grain Leather, Lug Sole', gsm: 'N/A', wash_care: 'Leather conditioner, spot clean' } },
];

export interface LandingConfig {
  heroDesktop?: string;
  heroMobile?: string;
  collection1?: string;
  collection2?: string;
  collection3?: string;
  collection4?: string;
  latestDrop?: string;
  dailyWear?: string;
  sneakers?: string;
  bestStore?: string;
  promoBanner1?: string;
  promoBanner2?: string;
  [key: string]: any;
}

export interface StoreState {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  isMember: boolean;
  filters: FilterState;
  leads: Lead[];
  appReady: boolean;
  currentUser: User | null;
  landingConfig: LandingConfig | null;
  setAppReady: (ready: boolean) => void;
  setFirebaseProducts: (products: Product[]) => void;
  setLandingConfig: (config: LandingConfig) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  accountOpen: boolean;
  setAccountOpen: (open: boolean) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Product) => void;
  deleteProduct: (id: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
  toggleMembership: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  addLead: (lead: Lead) => void;
  deleteLead: (email: string) => void;
  login: (user: User) => void;
  logout: () => void;
  
  // Chat state
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  lastViewedProduct: string | null;
  setLastViewedProduct: (id: string | null) => void;

  // Loader state
  loaderFinished: boolean;
  setLoaderFinished: (finished: boolean) => void;
}

const defaultFilters: FilterState = {
  sizes: [],
  fits: [],
  themes: [],
  priceRange: [0, 3000],
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: MOCK_PRODUCTS,
      cart: [],
      wishlist: [],
      isMember: false,
      filters: { ...defaultFilters },
      leads: [],
      appReady: false,
      currentUser: null,
      landingConfig: null,
      loaderFinished: false,
      setLoaderFinished: (finished) => set({ loaderFinished: finished }),
      setAppReady: (ready) => set({ appReady: ready }),
      // Called by FirebaseProvider when Firebase has products — replaces mock data
      setFirebaseProducts: (products) => set({ products }),
      setLandingConfig: (config) => set({ landingConfig: config }),
      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),
      accountOpen: false,
      setAccountOpen: (open) => set({ accountOpen: open }),
      isChatOpen: false,
      setIsChatOpen: (open) => set({ isChatOpen: open }),
      lastViewedProduct: null,
      setLastViewedProduct: (id) => set({ lastViewedProduct: id }),

      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),

      updateProduct: (id, updated) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? updated : p)),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find(
            (c) => c.productId === item.productId && c.size === item.size
          );
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.productId === item.productId && c.size === item.size
                  ? { ...c, quantity: c.quantity + item.quantity }
                  : c
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),

      removeFromCart: (productId, size) =>
        set((state) => ({
          cart: state.cart.filter(
            (c) => !(c.productId === productId && c.size === size)
          ),
        })),

      updateQuantity: (productId, size, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              cart: state.cart.filter(
                (c) => !(c.productId === productId && c.size === size)
              ),
            };
          }
          return {
            cart: state.cart.map((c) =>
              c.productId === productId && c.size === size
                ? { ...c, quantity }
                : c
            ),
          };
        }),

      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),

      toggleMembership: () =>
        set((state) => ({ isMember: !state.isMember })),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set({ filters: { ...defaultFilters } }),

      addLead: (lead) =>
        set((state) => ({ leads: [lead, ...state.leads] })),

      deleteLead: (email) =>
        set((state) => ({ leads: state.leads.filter((l) => l.email !== email) })),
        
      login: (user) => set({ currentUser: user }),
      
      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'adis-store',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        isMember: state.isMember,
        leads: state.leads,
        currentUser: state.currentUser,
      }),
    }
  )
);
