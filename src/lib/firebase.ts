'use client';

// Firebase config — same project used by admin dashboard
export const firebaseConfig = {
  apiKey: "AIzaSyA358G8v6GSaqdUemaME3-CKdqekxp9kcg",
  authDomain: "adiscreations.firebaseapp.com",
  databaseURL: "https://ADIScreations-default-rtdb.firebaseio.com",
  projectId: "ADIScreations",
  storageBucket: "adiscreations.firebasestorage.app",
  messagingSenderId: "593523996212",
  appId: "1:593523996212:web:07ab25c74fa1cc0b2ebc61",
};

let _app: any = null;
let _db: any = null;
let _dbAvailable: boolean | null = null; // null = unknown, true = ok, false = unavailable

export async function getFirebaseDB() {
  // Temporary: Firebase is not connected yet. Return null to force LocalStorage fallback.
  _dbAvailable = false;
  return null;

  /*
  if (_dbAvailable === false) return null;
  if (_db) return _db;

  try {

    const { initializeApp, getApps } = await import('firebase/app');
    const { getDatabase } = await import('firebase/database');

    if (!getApps().length) {
      _app = initializeApp(firebaseConfig);
    } else {
      _app = getApps()[0];
    }

    _db = getDatabase(_app);
    _dbAvailable = true;
    return _db;
  } catch (e) {
    console.error('[Firebase] Init failed:', e);
    _dbAvailable = false;
    return null;
  }
  */
}

/* ──────────────────────────────────────────────────────────
 * LOCAL STORAGE FALLBACK
 * Used when Firebase is unavailable (DB not created yet, offline, etc.)
 * Stores users and orders in localStorage under the ADIS_ namespace.
 * ────────────────────────────────────────────────────────── */

const LS_USERS  = 'ADIS_users';
const LS_ORDERS = 'ADIS_orders';

function lsGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function lsSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export type LocalUser = {
  phone: string; name?: string; email?: string | null;
  gender?: string | null; birthdate?: string | null;
  city?: string | null; password: string; createdAt: string;
};
export type LocalOrder = {
  id: string; phone: string; items: unknown[]; total: number;
  status: string; delivery?: unknown; createdAt: string;
};

/** Get a user from localStorage by phone */
export function localGetUser(phone: string): LocalUser | null {
  const users = lsGet<Record<string, LocalUser>>(LS_USERS) || {};
  return users[phone] || null;
}

/** Save a user to localStorage */
export function localSaveUser(user: LocalUser) {
  const users = lsGet<Record<string, LocalUser>>(LS_USERS) || {};
  users[user.phone] = user;
  lsSet(LS_USERS, users);
}

/** Get all orders for a phone number */
export function localGetOrders(phone: string): LocalOrder[] {
  const all = lsGet<Record<string, Record<string, LocalOrder>>>(LS_ORDERS) || {};
  return Object.values(all[phone] || {}).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Save an order to localStorage */
export function localSaveOrder(phone: string, order: LocalOrder) {
  const all = lsGet<Record<string, Record<string, LocalOrder>>>(LS_ORDERS) || {};
  if (!all[phone]) all[phone] = {};
  all[phone][order.id] = order;
  lsSet(LS_ORDERS, all);
}
