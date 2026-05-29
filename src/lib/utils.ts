import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getTotalStock(variants: { stock: number }[]): number {
  return variants.reduce((acc, v) => acc + v.stock, 0);
}

export function getFreeShippingProgress(cartTotal: number, threshold = 999): number {
  if (cartTotal >= threshold) return 100;
  return Math.round((cartTotal / threshold) * 100);
}
