'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  Store,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { label: 'Products', icon: Package, href: '/admin' },
  { label: 'Inventory Alerts', icon: AlertTriangle, href: '/admin' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="h-full flex flex-col bg-admin-sidebar text-white">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="text-xl font-black tracking-wider uppercase">
          ADIS
        </Link>
        <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Store className="w-4 h-4" />
          Go to Storefront
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
        {sidebar}
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-admin-sidebar text-white rounded-lg"
        aria-label="Open admin menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-72 z-50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
