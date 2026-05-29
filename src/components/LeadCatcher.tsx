'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function LeadCatcher() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const addLead = useStore((s) => s.addLead);

  // Show after 15 seconds (after page is fully loaded and user is browsing)
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('adis-lead-seen');
    if (hasSeen) return;
    const t = setTimeout(() => setVisible(true), 15000);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return;
    addLead({ ...form, createdAt: new Date().toISOString() });
    sessionStorage.setItem('adis-lead-seen', '1');
    setSubmitted(true);
    setTimeout(() => setVisible(false), 3000);
  };

  const handleClose = () => {
    sessionStorage.setItem('adis-lead-seen', '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-[900] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[901] inset-0 flex items-center justify-center p-4"
          >
            {/* Close button — floated above the card, always visible */}
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[902] flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-700 hover:text-black border border-gray-200 shadow-lg px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 backdrop-blur-sm"
            >
              <X className="w-3.5 h-3.5" />
              Close
            </button>

            <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">

              {/* Top banner */}
              <div className="bg-black pt-8 pb-12 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFE600]/20 to-transparent" />
                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-[#FFE600] rounded-2xl mb-4 shadow-xl shadow-yellow-900/20"
                >
                  <Gift className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-white font-black text-2xl tracking-wider">
                  UNLOCK <span className="text-[#FFE600]">15% OFF</span>
                </h2>
                <p className="text-white/60 text-sm mt-1">Your first order. Exclusive member perks.</p>
              </div>

              {/* Coupon chip overlap */}
              <div className="flex justify-center -mt-6 relative z-10">
                <div className="bg-[#FFE600] text-black text-xs font-black px-5 py-2 rounded-full tracking-widest shadow-lg">
                  USE CODE: ADIS15
                </div>
              </div>

              {/* Form / Success */}
              <div className="px-6 pt-5 pb-7">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-3 py-4"
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                      <p className="font-bold text-lg text-center">You're in! 🎉</p>
                      <p className="text-sm text-gray-500 text-center">Check your email for the discount code.</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-3"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-3 text-center">
                          Join 50,000+ fans who shop ADIS
                        </p>
                      </div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FFE600] focus:bg-white transition-colors"
                      />
                      <input
                        type="email"
                        placeholder="Email Address *"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FFE600] focus:bg-white transition-colors"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number (optional)"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FFE600] focus:bg-white transition-colors"
                      />
                      <button
                        type="submit"
                        className="w-full bg-[#FFE600] text-black py-3.5 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-[#D4BF00] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-200"
                      >
                        Claim My 15% Off <ArrowRight className="w-4 h-4" />
                      </button>
                      <p className="text-[10px] text-gray-400 text-center">
                        No spam. Unsubscribe anytime. 🔒 Your data is safe.
                      </p>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full text-center text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors pt-1"
                      >
                        No thanks, I don't want a discount
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
