'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { getFirebaseDB, localGetUser, localSaveUser, localGetOrders } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, LogOut, Package, Phone, Lock, Mail, Calendar,
  ChevronRight, ChevronLeft, MapPin, CheckCircle2, Eye, EyeOff, X
} from 'lucide-react';
import type { Order } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
}

/* ── Helpers ─────────────────────────────────────────────── */
function sanitizeKey(phone: string): string {
  return phone.replace(/[.#$[\]]/g, '_');
}
function hashPassword(password: string): string {
  return Array.from(password)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

const INPUT =
  'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#FFE600]/60 focus:bg-black/60 transition-all text-sm';
const LABEL = 'block text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1.5';

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div
      className={`w-2 h-2 rounded-full transition-all duration-300 ${
        done ? 'bg-[#FFE600] scale-125' : active ? 'bg-[#FFE600]/60 scale-110' : 'bg-white/20'
      }`}
    />
  );
}

export default function AccountDrawer({ open, onClose }: AccountDrawerProps) {
  const { currentUser, login, logout, setAccountOpen } = useStore();

  /* Auth state */
  const [isLoginView, setIsLoginView] = useState(true);
  const [step, setStep] = useState(0); // registration step: 0 = credentials, 1 = profile, 2 = extras

  /* Credentials */
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /* Profile fields */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [birthdate, setBirthdate] = useState('');
  const [city, setCity] = useState('');

  /* UI state */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* Orders */
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Stop body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  useEffect(() => {
    if (currentUser && open) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, open]);

  function switchView(toLogin: boolean) {
    setIsLoginView(toLogin);
    setStep(0);
    setError('');
    setSuccess('');
    setPhone('');
    setPassword('');
    setName('');
    setEmail('');
    setGender('');
    setBirthdate('');
    setCity('');
  }

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const db = await getFirebaseDB();
      if (db && currentUser) {
        const { ref, get } = await import('firebase/database');
        const key = sanitizeKey(currentUser.phone);
        try {
          const snap = await get(ref(db, `orders/${key}`));
          if (snap.exists()) {
            const list = Object.values(snap.val()) as Order[];
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(list);
            setLoadingOrders(false);
            return;
          }
        } catch { /* fall through to local */ }
      }
      if (currentUser) {
        const localOrders = localGetOrders(currentUser.phone);
        setOrders(localOrders as unknown as Order[]);
      }
    } catch (e) {
      console.error('Orders fetch failed:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  function validateStep0() {
    if (phone.trim().length < 10) { setError('Enter a valid 10-digit phone number'); return false; }
    if (password.length < 4) { setError('Password must be at least 4 characters'); return false; }
    setError('');
    return true;
  }

  function validateStep1() {
    if (!name.trim()) { setError('Please enter your full name'); return false; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return false;
    }
    setError('');
    return true;
  }

  async function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    if (step === 0) {
      if (!validateStep0()) return;
      setLoading(true);
      try {
        const db = await getFirebaseDB();
        let exists = false;
        if (db) {
          try {
            const { ref, get } = await import('firebase/database');
            const snap = await get(ref(db, `users/${sanitizeKey(phone.trim())}`));
            exists = snap.exists();
          } catch { /* fall through to local */ }
        }
        if (!exists) {
          exists = !!localGetUser(phone.trim());
        }
        if (exists) { setError('An account with this phone already exists.'); return; }
      } catch { /* offline — allow proceed */ }
      finally { setLoading(false); }
      setStep(1);
    } else if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const trimmed = phone.trim();
      const key = sanitizeKey(trimmed);
      const db = await getFirebaseDB();
      const newUser = {
        phone: trimmed,
        name: name.trim(),
        email: email.trim() || null,
        gender: gender || null,
        birthdate: birthdate || null,
        city: city.trim() || null,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
      };

      let saved = false;
      if (db) {
        try {
          const { ref, get, set } = await import('firebase/database');
          const snap = await get(ref(db, `users/${key}`));
          if (snap.exists()) { setError('An account with this phone already exists.'); return; }
          await set(ref(db, `users/${key}`), newUser);
          saved = true;
        } catch { /* fall to local */ }
      }
      if (!saved) {
        if (localGetUser(trimmed)) { setError('An account with this phone already exists.'); return; }
        localSaveUser(newUser);
      }

      setSuccess('Welcome to ADIS! Your account is ready 🎉');
      setTimeout(() => login({
        phone: trimmed,
        name: name.trim(),
        email: email || undefined,
        gender: gender as any || undefined,
        birthdate: birthdate || undefined,
        city: city || undefined,
        createdAt: newUser.createdAt,
      }), 1200);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (phone.trim().length < 10) { setError('Enter a valid 10-digit phone number'); return; }
    if (!password) { setError('Enter your password'); return; }
    setLoading(true);
    try {
      const trimmed = phone.trim();
      const db = await getFirebaseDB();
      let userData: any = null;

      if (db) {
        try {
          const { ref, get } = await import('firebase/database');
          const snap = await get(ref(db, `users/${sanitizeKey(trimmed)}`));
          if (snap.exists()) userData = snap.val();
        } catch { /* fall to local */ }
      }
      if (!userData) {
        userData = localGetUser(trimmed);
      }

      if (!userData) { setError('No account found. Please register first.'); return; }
      if (userData.password !== hashPassword(password)) { setError('Incorrect password.'); return; }

      login({
        phone: userData.phone,
        name: userData.name,
        email: userData.email,
        gender: userData.gender,
        birthdate: userData.birthdate,
        city: userData.city,
        createdAt: userData.createdAt,
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h2 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-2">
                <User className="w-5 h-5 text-[#FFE600]" />
                {currentUser ? 'My Account' : 'Sign In'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {currentUser ? (
                // LOGGED-IN VIEW
                <div className="p-4 sm:p-6 pb-24">
                  {/* Profile Header */}
                  <div className="mb-6">
                    <p className="text-white/40 text-sm">
                      Welcome back,{' '}
                      <span className="text-[#FFE600] font-semibold">
                        {currentUser.name || currentUser.phone}
                      </span>
                    </p>
                    <p className="text-white/40 text-xs mt-1">{currentUser.phone}</p>
                  </div>

                  {/* Profile chips */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {currentUser.email && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px]">
                        <Mail className="w-3 h-3" /> {currentUser.email}
                      </span>
                    )}
                    {currentUser.gender && (
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px] capitalize">
                        {currentUser.gender.replace('_', ' ')}
                      </span>
                    )}
                    {currentUser.birthdate && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px]">
                        <Calendar className="w-3 h-3" />
                        {new Date(currentUser.birthdate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {currentUser.city && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px]">
                        <MapPin className="w-3 h-3" /> {currentUser.city}
                      </span>
                    )}
                  </div>

                  {/* Orders */}
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">My Orders</h3>
                  {loadingOrders ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FFE600]" />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-white/40 text-[10px]">Order #{order.id.slice(-6).toUpperCase()}</p>
                              <p className="text-white text-xs font-semibold mt-1">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[#FFE600] font-bold text-sm">₹{order.total}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-semibold text-white capitalize">
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2 border-t border-white/10 pt-3 mt-3">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex gap-3 items-center">
                                <img src={item.image} alt={item.title} className="w-12 h-14 object-cover rounded-lg flex-shrink-0" />
                                <div>
                                  <p className="text-white text-xs font-semibold line-clamp-1">{item.title}</p>
                                  <p className="text-white/40 text-[10px] mt-0.5">Size: {item.size} &nbsp;·&nbsp; Qty: {item.quantity}</p>
                                  <p className="text-[#FFE600] text-[10px] mt-0.5 font-bold">₹{item.price} each</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/3 border border-white/8 rounded-2xl p-10 text-center">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-6 h-6 text-white/20" />
                      </div>
                      <p className="text-white/40 text-sm mb-4">No orders placed yet.</p>
                      <button
                        onClick={onClose}
                        className="inline-block px-4 py-2 bg-white/10 text-white font-bold uppercase tracking-wider rounded-lg text-xs hover:bg-white/20 transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                // LOGGED-OUT VIEW
                <div className="p-4 sm:p-6 pb-24 h-full flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isLoginView ? 'login' : `reg-${step}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Form Header */}
                      <div className="mb-6 text-center">
                        <h1 className="text-2xl font-black uppercase text-white tracking-wide leading-tight mb-2">
                          {isLoginView ? 'Welcome Back' : step === 0 ? 'Create Account' : step === 1 ? 'Your Profile' : 'A Bit More'}
                        </h1>
                        <p className="text-white/40 text-xs">
                          {isLoginView
                            ? 'Sign in to access your orders & wishlist'
                            : step === 0
                            ? 'Step 1 of 3 — Credentials'
                            : step === 1
                            ? 'Step 2 of 3 — Basic Info'
                            : 'Step 3 of 3 — Optional Details'}
                        </p>
                        {/* Progress dots for registration */}
                        {!isLoginView && (
                          <div className="flex justify-center items-center gap-2 mt-4">
                            {[0, 1, 2].map((s) => (
                              <StepDot key={s} active={step === s} done={step > s} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Error / Success banners */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center"
                          >
                            {error}
                          </motion.div>
                        )}
                        {success && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-5 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs text-center flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" /> {success}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ── LOGIN FORM ──────────────────────────────── */}
                      {isLoginView && (
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div>
                            <label className={LABEL}>Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                className={`${INPUT} pl-10`}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}>Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                className={`${INPUT} pl-10 pr-10`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-[#FFE600] text-black font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-yellow-400 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
                          >
                            {loading ? 'Signing in…' : 'Sign In →'}
                          </button>
                        </form>
                      )}

                      {/* ── REGISTER STEP 0: Credentials ────────────── */}
                      {!isLoginView && step === 0 && (
                        <form onSubmit={handleNextStep} className="space-y-4">
                          <div>
                            <label className={LABEL}>Phone Number *</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                className={`${INPUT} pl-10`}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}>Create Password *</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 4 characters"
                                className={`${INPUT} pl-10 pr-10`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-[#FFE600] text-black font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-yellow-400 active:scale-[0.98] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                          >
                            {loading ? 'Checking…' : <><span>Continue</span><ChevronRight className="w-4 h-4" /></>}
                          </button>
                        </form>
                      )}

                      {/* ── REGISTER STEP 1: Basic Profile ──────────── */}
                      {!isLoginView && step === 1 && (
                        <form onSubmit={handleNextStep} className="space-y-4">
                          <div>
                            <label className={LABEL}>Full Name *</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className={`${INPUT} pl-10`}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}>Email Address <span className="normal-case text-white/25">(optional)</span></label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="yourname@email.com"
                                className={`${INPUT} pl-10`}
                              />
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}>Gender</label>
                            <div className="grid grid-cols-2 gap-2">
                              {([
                                { val: 'male', label: '♂ Male' },
                                { val: 'female', label: '♀ Female' },
                                { val: 'other', label: '⚧ Other' },
                                { val: 'prefer_not_to_say', label: '🔒 Prefer not to say' },
                              ] as { val: Gender; label: string }[]).map(({ val, label }) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setGender(gender === val ? '' : val)}
                                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                                    gender === val
                                      ? 'bg-[#FFE600]/10 border-[#FFE600]/50 text-[#FFE600]'
                                      : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setStep(0)}
                              className="flex items-center gap-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white text-sm transition-all"
                            >
                              <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                              type="submit"
                              className="flex-1 bg-[#FFE600] text-black font-black uppercase tracking-widest py-3 rounded-xl hover:bg-yellow-400 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
                            >
                              Continue <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </form>
                      )}

                      {/* ── REGISTER STEP 2: Extra details ──────────── */}
                      {!isLoginView && step === 2 && (
                        <form onSubmit={handleRegister} className="space-y-4">
                          <div>
                            <label className={LABEL}>Date of Birth <span className="normal-case text-white/25">(optional)</span></label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                              <input
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split('T')[0]}
                                className={`${INPUT} pl-10`}
                                style={{ colorScheme: 'dark' }}
                              />
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}>City / Town <span className="normal-case text-white/25">(optional)</span></label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                                className={`${INPUT} pl-10`}
                              />
                            </div>
                          </div>

                          {/* Summary preview */}
                          <div className="bg-[#FFE600]/5 border border-[#FFE600]/15 rounded-xl px-4 py-3 space-y-1">
                            <p className="text-[#FFE600] text-[10px] font-bold uppercase tracking-widest mb-2">Account Summary</p>
                            <div className="flex justify-between text-xs">
                              <span className="text-white/40">Name</span>
                              <span className="text-white font-semibold">{name}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-white/40">Phone</span>
                              <span className="text-white font-semibold">{phone}</span>
                            </div>
                            {email && (
                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">Email</span>
                                <span className="text-white font-semibold">{email}</span>
                              </div>
                            )}
                            {gender && (
                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">Gender</span>
                                <span className="text-white capitalize">{gender.replace('_', ' ')}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setStep(1)}
                              className="flex items-center gap-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white text-sm transition-all"
                            >
                              <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="flex-1 bg-[#FFE600] text-black font-black uppercase tracking-widest py-3 rounded-xl hover:bg-yellow-400 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
                            >
                              {loading ? 'Creating…' : '🎉 Create'}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Switch login ↔ register */}
                      <div className="mt-6 pt-5 border-t border-white/8 text-center">
                        <p className="text-white/40 text-xs">
                          {isLoginView ? "Don't have an account? " : 'Already have an account? '}
                          <button
                            type="button"
                            onClick={() => switchView(!isLoginView)}
                            className="text-[#FFE600] hover:underline font-bold"
                          >
                            {isLoginView ? 'Register Free' : 'Sign In'}
                          </button>
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Logout button sticky at bottom if logged in */}
            {currentUser && (
              <div className="p-4 border-t border-white/10 bg-black">
                <button
                  onClick={() => {
                    logout();
                    setAccountOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white/70 hover:text-red-400 rounded-xl transition-all text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
