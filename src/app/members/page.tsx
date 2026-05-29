'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/Navbar';
import {
  ShieldCheck, Zap, Tag, Truck, Crown, Star, Check, X,
  Percent, Gift, Clock, RefreshCw, Headphones, Lock, Video,
  MessageCircle, Home, Scissors
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BENEFITS = [
  {
    icon: Tag,
    title: 'Up to 30% Off Every Drop',
    desc: 'Exclusive member pricing on every single product — automatically applied at checkout.',
    color: 'from-yellow-400/20 to-orange-400/20',
    iconColor: 'text-yellow-500',
  },
  {
    icon: Zap,
    title: 'Early Access Drops',
    desc: 'Get 24-hour early access to all new collections before they go live to the public.',
    color: 'from-purple-400/20 to-pink-400/20',
    iconColor: 'text-purple-500',
  },
  {
    icon: Truck,
    title: 'Free Shipping Always',
    desc: 'Free delivery on every order, no minimum spend required. Ever.',
    color: 'from-blue-400/20 to-cyan-400/20',
    iconColor: 'text-blue-500',
  },
  {
    icon: Gift,
    title: 'Birthday Surprise Drop',
    desc: 'A special mystery gift shipped to you every year on your birthday. 🎁',
    color: 'from-pink-400/20 to-rose-400/20',
    iconColor: 'text-pink-500',
  },
  {
    icon: RefreshCw,
    title: 'Extended 30-Day Returns',
    desc: 'Non-members get 15 days. You get 30 days — no questions asked.',
    color: 'from-green-400/20 to-emerald-400/20',
    iconColor: 'text-green-500',
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    desc: 'Jump to the front of the queue. Our team responds to members first.',
    color: 'from-orange-400/20 to-red-400/20',
    iconColor: 'text-orange-500',
  },
  {
    icon: Video,
    title: '1-on-1 Video Shopping',
    desc: 'Book a personal video session with our stylists to see products live before buying.',
    color: 'from-teal-400/20 to-cyan-400/20',
    iconColor: 'text-teal-500',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Concierge',
    desc: 'Text your personal shopper anytime. We\'ll build your outfits, find your sizes, and place your orders.',
    color: 'from-green-400/20 to-emerald-500/20',
    iconColor: 'text-green-500',
  },
  {
    icon: Home,
    title: 'Home Try-On Program',
    desc: 'Order up to 5 items, try them at home for 3 days, and only pay for what you decide to keep.',
    color: 'from-indigo-400/20 to-violet-500/20',
    iconColor: 'text-indigo-500',
  },
  {
    icon: Scissors,
    title: 'Free Custom Alterations',
    desc: 'Pants too long? Sleeve too loose? Members get free basic tailoring on all ADIS apparel.',
    color: 'from-rose-400/20 to-red-500/20',
    iconColor: 'text-rose-500',
  },
];

const COMPARE = [
  { feature: 'Member Discount', free: false, pro: '10–30% Off' },
  { feature: 'Free Shipping', free: '₹999+ orders', pro: 'Always Free' },
  { feature: 'Early Access', free: false, pro: '24 hrs early' },
  { feature: 'Birthday Gift', free: false, pro: true },
  { feature: 'Returns Window', free: '15 days', pro: '30 days' },
  { feature: 'Priority Support', free: false, pro: true },
  { feature: 'Video Call Shopping', free: false, pro: true },
  { feature: 'WhatsApp Concierge', free: false, pro: true },
  { feature: 'Home Try-On (Pay Later)', free: false, pro: true },
  { feature: 'Free Alterations', free: false, pro: true },
  { feature: 'Exclusive Fandoms', free: false, pro: true },
];

const TESTIMONIALS = [
  { name: 'Arjun M.', location: 'Mumbai', quote: 'Saved over ₹4,000 in 3 months just from the member pricing alone. Worth every rupee!', rating: 5 },
  { name: 'Priya S.', location: 'Bangalore', quote: 'The early access is unreal. Got the Naruto collab tee before it sold out in 10 minutes!', rating: 5 },
  { name: 'Rohit K.', location: 'Delhi', quote: 'Free shipping alone pays for itself. I order frequently so this is a no-brainer.', rating: 5 },
];

export default function MembersPage() {
  const { isMember, toggleMembership } = useStore();
  const [activating, setActivating] = useState(false);

  const handleActivate = () => {
    setActivating(true);
    setTimeout(() => {
      toggleMembership();
      setActivating(false);
    }, 800);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pb-32 md:pb-16">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          {/* BG glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,230,0,0.12)_0%,transparent_60%)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FFE600]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#FFE600]/10 border border-[#FFE600]/30 rounded-full px-4 py-1.5 text-[#FFE600] text-xs font-black uppercase tracking-widest mb-6"
            >
              <Crown className="w-3.5 h-3.5" />
              ADIS Pro Membership
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none mb-4"
            >
              Shop Smarter.{' '}
              <span className="text-[#FFE600]" style={{ textShadow: '0 0 40px rgba(255,230,0,0.4)' }}>
                Save More.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/60 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Join thousands of ADIS fans who get exclusive discounts, early drops, free shipping, and more — every single time they shop.
            </motion.p>

            {isMember ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex flex-col items-center gap-3"
              >
                <div className="flex items-center gap-2 bg-[#FFE600] text-black px-8 py-4 rounded-full text-base font-black uppercase tracking-wider">
                  <ShieldCheck className="w-5 h-5" />
                  You&apos;re an ADIS Pro Member!
                </div>
                <p className="text-white/40 text-xs">All benefits are active on your account.</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="group relative inline-flex items-center gap-2 bg-[#FFE600] text-black px-8 py-4 rounded-full text-sm font-black uppercase tracking-wider hover:bg-yellow-300 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,230,0,0.3)] disabled:opacity-70"
                >
                  {activating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Activate Free Membership
                    </>
                  )}
                </button>
                <Link
                  href="/#men"
                  className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider hover:border-white/50 transition-colors"
                >
                  Browse First
                </Link>
              </motion.div>
            )}

            <p className="text-white/30 text-xs mt-4">✦ Free to join · No card required · Instant activation</p>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="border-y border-white/5 py-8 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
            {[
              { value: '12,400+', label: 'Active Members' },
              { value: '₹850', label: 'Avg. Saved per Order' },
              { value: '4.9★', label: 'Member Rating' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl sm:text-3xl font-black text-[#FFE600]">{value}</p>
                <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BENEFITS GRID ── */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">Everything Included</h2>
            <p className="text-white/40 text-sm">Every perk, zero catch.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  'relative rounded-2xl p-5 border border-white/8 bg-gradient-to-br',
                  b.color
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center mb-4', b.iconColor)}>
                  <b.icon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-[15px] mb-1.5">{b.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="max-w-2xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Member vs Non-Member</h2>
            <p className="text-white/40 text-sm">See exactly what you&apos;re missing.</p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/10">
            {/* Header */}
            <div className="grid grid-cols-3 bg-white/5">
              <div className="p-4 text-xs font-black uppercase tracking-wider text-white/40">Feature</div>
              <div className="p-4 text-center text-xs font-black uppercase tracking-wider text-white/40">Free</div>
              <div className="p-4 text-center text-xs font-black uppercase tracking-wider text-[#FFE600] flex items-center justify-center gap-1.5">
                <Crown className="w-3 h-3" /> Pro Member
              </div>
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.feature} className={cn('grid grid-cols-3 border-t border-white/5', i % 2 === 0 ? 'bg-white/[0.02]' : '')}>
                <div className="p-4 text-sm font-semibold text-white/70">{row.feature}</div>
                <div className="p-4 flex items-center justify-center">
                  {row.free === false ? (
                    <X className="w-4 h-4 text-white/20" />
                  ) : (
                    <span className="text-xs text-white/50 font-semibold text-center">{row.free}</span>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center">
                  {row.pro === true ? (
                    <Check className="w-4 h-4 text-[#FFE600]" />
                  ) : (
                    <span className="text-xs text-[#FFE600] font-black text-center">{row.pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Members Love It</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-5 bg-white/5 border border-white/8"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#FFE600] text-[#FFE600]" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-black">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="max-w-xl mx-auto px-4 py-12 text-center">
          <div className="rounded-3xl bg-gradient-to-br from-[#FFE600]/10 to-[#FFE600]/5 border border-[#FFE600]/20 p-8">
            <Crown className="w-10 h-10 text-[#FFE600] mx-auto mb-4" />
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              {isMember ? 'You\'re In! 🎉' : 'Ready to Join?'}
            </h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              {isMember
                ? 'Your Pro Member benefits are active. Enjoy exclusive pricing on every drop!'
                : 'Join for free. Save instantly. No credit card, no catch, no expiry.'}
            </p>
            {isMember ? (
              <Link
                href="/#men"
                className="inline-flex items-center gap-2 bg-[#FFE600] text-black px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider hover:bg-yellow-300 transition-colors"
              >
                Shop With Member Pricing →
              </Link>
            ) : (
              <button
                onClick={handleActivate}
                disabled={activating}
                className="w-full bg-[#FFE600] text-black py-4 rounded-full text-sm font-black uppercase tracking-wider hover:bg-yellow-300 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,230,0,0.25)] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {activating ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Activating...</>
                ) : (
                  <><Crown className="w-4 h-4" /> Activate Free Membership</>
                )}
              </button>
            )}
            <p className="text-white/20 text-[10px] mt-3">✦ Completely free · Instant · No spam</p>
          </div>
        </section>

      </main>
    </>
  );
}
