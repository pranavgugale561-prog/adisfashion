'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingBag, Heart, X,
  User, ShieldCheck, Home, Shirt, Flame, Info, Crown, Camera, Store, Watch
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import CartDrawer from '@/components/CartDrawer';
import AccountDrawer from '@/components/AccountDrawer';

// Smooth scroll helper — works for same-page anchors + cross-page anchors
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const NAV_LINKS = [
  { label: 'Home',       href: '/',           anchor: null },
  { label: 'Shop',       href: '/shop',       anchor: null },
  { label: 'Men',        href: '/men',        anchor: null },
  { label: 'Daily Wear', href: '/daily-wear', anchor: null },
  { label: 'Sneakers',   href: '/sneakers',   anchor: null },
  { label: 'Premium Accessories', href: '/premium-accessories', anchor: null },
  { label: 'Feeds',      href: '/feeds',      anchor: null },
  { label: 'Members',    href: '/members',    anchor: null },
  { label: 'About',      href: '/#about',     anchor: 'about' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cart, wishlist, isMember, toggleMembership, products, cartOpen, setCartOpen, accountOpen, setAccountOpen, currentUser } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof products>([]);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);
  const wishlistCount = wishlist.length;
  const isHome = pathname === '/';

  // Track which section is in viewport
  useEffect(() => {
    if (!isHome) return;
    const ids = ['about'];
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveAnchor(id); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [isHome]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(
      products.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.fandom_tag.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, products]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, link: typeof NAV_LINKS[0]) {
    if (isHome && link.anchor) {
      e.preventDefault();
      scrollToSection(link.anchor);
    }
  }

  function isActive(link: typeof NAV_LINKS[0]) {
    if (link.href === '/' && isHome && !activeAnchor) return true;
    if (link.anchor && activeAnchor === link.anchor) return true;
    if (link.href !== '/' && !link.href.startsWith('/#') && pathname.startsWith(link.href)) return true;
    return false;
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md shadow-[0_1px_0_rgba(255,230,0,0.15)]">
      {/* Announcement bar */}
      <div className="bg-[#FFE600] text-black text-[11px] sm:text-xs text-center py-2 px-4 tracking-[0.2em] font-bold uppercase">
        Welcome to ADIS — Get 10% OFF your first order! Use code: ADIS10
      </div>

      <nav className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Mobile hamburger - REMOVED for bottom dock */}

            {/* Desktop nav links — LEFT */}
            <div className="flex-1 items-center justify-start gap-6 hidden lg:flex">
              {NAV_LINKS.map((link) => {
                if (link.label === 'Members') {
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all duration-200 whitespace-nowrap',
                        isActive(link)
                          ? 'bg-[#FFE600] text-black border-[#FFE600]'
                          : 'border-[#FFE600]/40 text-[#FFE600] hover:bg-[#FFE600] hover:text-black'
                      )}
                    >
                      <Crown className="w-3 h-3" />
                      Members
                    </Link>
                  );
                }
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className={cn(
                      'text-[13px] font-bold uppercase tracking-wider transition-all duration-200 relative pb-1 whitespace-nowrap',
                      isActive(link)
                        ? 'text-[#FFE600] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#FFE600] after:rounded-full'
                        : 'text-white/50 hover:text-white'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Logo — CENTER */}
            <div className="flex-1 flex justify-center lg:justify-center">
              <Link href="/" className="flex items-center select-none gap-1.5" aria-label="ADIS Home">
                <div className="flex items-center">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1, 1, 0.7, 1, 0.8, 1] }}
                    transition={{ repeat: Infinity, duration: 3, times: [0, 0.05, 0.1, 0.4, 0.45, 0.5, 0.8, 1], ease: "linear" }}
                    className="font-black text-[24px] sm:text-[28px] leading-none"
                    style={{
                      color: '#FFE600',
                      fontFamily: '"Poppins", sans-serif',
                      textShadow: '0 0 20px rgba(255,230,0,0.6)',
                      letterSpacing: '-1px',
                    }}
                  >
                    A
                  </motion.span>
                  <span
                    className="font-black text-[24px] sm:text-[28px] leading-none text-white"
                    style={{ fontFamily: '"Poppins", sans-serif', letterSpacing: '-1px' }}
                  >
                    DIS
                  </span>
                </div>
                <div className="flex items-center">
                  <motion.span
                    animate={{ opacity: [1, 1, 0.5, 1, 0.9, 1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.2, 0.25, 0.3, 0.6, 0.65, 0.9, 1], ease: "linear" }}
                    className="font-black text-[24px] sm:text-[28px] leading-none"
                    style={{
                      color: '#FFE600',
                      fontFamily: '"Poppins", sans-serif',
                      textShadow: '0 0 20px rgba(255,230,0,0.6)',
                      letterSpacing: '-1px',
                    }}
                  >
                    F
                  </motion.span>
                  <span
                    className="font-black text-[24px] sm:text-[28px] leading-none text-white"
                    style={{ fontFamily: '"Poppins", sans-serif', letterSpacing: '-1px' }}
                  >
                    ASHION
                  </span>
                </div>
              </Link>
            </div>

            {/* Icons — RIGHT */}
            <div className="flex-1 flex items-center justify-end gap-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-white/70 hover:text-[#FFE600] transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={toggleMembership}
                className={cn(
                  'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-200',
                  isMember
                    ? 'bg-[#FFE600] text-black border-[#FFE600]'
                    : 'border-white/20 text-white/50 hover:border-[#FFE600] hover:text-[#FFE600]'
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {isMember ? 'Member' : 'Join'}
              </button>

              <button
                onClick={() => setAccountOpen(true)}
                className="relative p-2 transition-colors cursor-pointer"
                aria-label="My Account"
                title={currentUser ? `Hi, ${currentUser.name || currentUser.phone}` : 'Sign In / My Orders'}
              >
                <User className={cn('w-5 h-5', currentUser ? 'text-[#FFE600]' : 'text-white/70 hover:text-[#FFE600]')} />
                {currentUser && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full border border-black" />
                )}
              </button>

              <Link href="/" className="relative p-2 text-white/70 hover:text-[#FFE600] transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-0 bg-[#FFE600] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <div 
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-white/70 hover:text-[#FFE600] transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#FFE600] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 bg-black/95 border-b border-white/10 shadow-2xl z-50 px-4 py-4"
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2.5">
                <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search products, fandoms, categories…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
                  {searchResults.slice(0, 6).map((p) => (
                    <Link
                      key={p.id}
                      href={p.category === 'Daily Wear' ? `/daily-wear/${p.id}` : p.category === 'Sneakers' ? `/sneakers/${p.id}` : `/men/${p.id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl p-2 transition-colors"
                    >
                      <img src={p.images[0]} alt={p.title} className="w-10 h-12 object-cover rounded-lg flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{p.title}</p>
                        <p className="text-[#FFE600] text-[10px] font-bold mt-0.5">₹{p.prices.sale}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-white/30 text-sm text-center py-4">No results for "{searchQuery}"</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>




    </header>

    {/* iOS 16.4 Style Floating Bottom Dock (Mobile Only) - MOVED OUTSIDE OF HEADER TO ESCAPE BACKDROP-BLUR STACKING CONTEXT */}
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden w-[92%] max-w-[400px]">
      <div className="flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
        {NAV_LINKS.map((link) => {
          const active = isActive(link);
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 transition-all duration-300',
                active ? 'text-[#FFE600]' : 'text-white/40 hover:text-white/80'
              )}
            >
              <div className={cn('transition-transform duration-300', active ? '-translate-y-1 scale-110' : '')}>
                {link.label === 'Home' && <Home className="w-5 h-5" />}
                {link.label === 'Shop' && <Store className="w-5 h-5" />}
                {link.label === 'Men' && <Shirt className="w-5 h-5" />}
                {link.label === 'Daily Wear' && <User className="w-5 h-5" />}
                {link.label === 'Sneakers' && <Flame className="w-5 h-5" />}
                {link.label === 'Premium Accessories' && <Watch className="w-5 h-5" />}
                {link.label === 'Feeds' && <Camera className="w-5 h-5" />}
                {link.label === 'Members' && <Crown className={cn('w-5 h-5', active ? 'text-[#FFE600]' : '')} />}
                {link.label === 'About' && <Info className="w-5 h-5" />}
              </div>
              
              <span className={cn(
                'text-[9px] font-bold uppercase tracking-wider transition-all duration-300',
                active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute'
              )}>
                {link.label}
              </span>
              
              {active && (
                 <motion.div 
                   layoutId="mobile-dock-indicator" 
                   className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-[#FFE600] shadow-[0_0_8px_#FFE600]" 
                 />
              )}
            </Link>
          );
        })}
      </div>
    </div>
    
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    <AccountDrawer open={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}
