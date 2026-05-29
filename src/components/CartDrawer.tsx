'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, getFreeShippingProgress } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, Truck, User, Phone, MapPin, ChevronRight, CheckCircle, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFirebaseDB, localSaveOrder } from '@/lib/firebase';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

const WHATSAPP_NUMBER = '918888405282';

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, currentUser } = useStore();
  const [step, setStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [info, setInfo] = useState<CustomerInfo>({ name: '', phone: '', address: '', city: '', pincode: '' });
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});
  const [savingOrder, setSavingOrder] = useState(false);

  // Auto-prefill from logged-in user profile
  useEffect(() => {
    if (currentUser) {
      setInfo(prev => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        phone: prev.phone || currentUser.phone || '',
        city: prev.city || currentUser.city || '',
      }));
    }
  }, [currentUser, open]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const progress = getFreeShippingProgress(subtotal);
  const freeShipRemaining = 999 - subtotal;
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  const validate = () => {
    const e: Partial<CustomerInfo> = {};
    if (!info.name.trim()) e.name = 'Name is required';
    if (!info.phone.trim() || !/^\d{10}$/.test(info.phone.trim())) e.phone = 'Valid 10-digit number required';
    if (!info.address.trim()) e.address = 'Address is required';
    if (!info.city.trim()) e.city = 'City is required';
    if (!info.pincode.trim() || !/^\d{6}$/.test(info.pincode.trim())) e.pincode = 'Valid 6-digit pincode required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildWhatsAppMessage = () => {
    const orderLines = cart
      .map((item, i) =>
        `${i + 1}. *${item.title}*\n   Size: ${item.size} | Qty: ${item.quantity} | Price: ${formatCurrency(item.price * item.quantity)}`
      )
      .join('\n');

    const msg = `🛍️ *NEW ORDER — ADIS FASHION*
━━━━━━━━━━━━━━━━━━━━━━
👤 *Customer Details*
• Name: ${info.name}
• Phone: ${info.phone}
• Address: ${info.address}, ${info.city} — ${info.pincode}

📦 *Order Summary*
━━━━━━━━━━━━━━━━━━━━━━
${orderLines}

━━━━━━━━━━━━━━━━━━━━━━
💰 Subtotal: ${formatCurrency(subtotal)}
🚚 Shipping: ${shipping === 0 ? 'FREE' : formatCurrency(shipping)}
✅ *Total: ${formatCurrency(total)}*
━━━━━━━━━━━━━━━━━━━━━━
📅 Order placed on: ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}

Please confirm this order. Thank you! 🙏`;

    return encodeURIComponent(msg);
  };

  const saveOrderToFirebase = async (orderId: string, orderData: any) => {
    try {
      const db = await getFirebaseDB();
      if (db && currentUser) {
        const { ref, set } = await import('firebase/database');
        const phoneKey = currentUser.phone.replace(/[.#$[\]]/g, '_');
        try {
          await set(ref(db, `orders/${phoneKey}/${orderId}`), orderData);
          return; // saved to Firebase successfully
        } catch { /* fall through to local */ }
      }
      // LocalStorage fallback
      if (currentUser) {
        localSaveOrder(currentUser.phone, orderData);
      }
    } catch (e) {
      console.error('Order save failed:', e);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setSavingOrder(true);
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    if (currentUser) {
      const orderData = {
        id: orderId,
        phone: currentUser.phone,
        items: cart.map(item => ({ ...item })),
        total,
        status: 'processing' as const,
        delivery: {
          name: info.name,
          address: info.address,
          city: info.city,
          pincode: info.pincode,
          contactPhone: info.phone,
        },
        createdAt: new Date().toISOString(),
      };
      await saveOrderToFirebase(orderId, orderData);
    }
    setSavingOrder(false);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`;
    window.open(waUrl, '_blank');
    setStep('success');
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setStep('cart'), 400);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[200]"
            onClick={handleClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white text-black shadow-2xl z-[201] flex flex-col"
          >
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {step === 'cart' && <ShoppingBag className="w-5 h-5" />}
                {step === 'details' && <User className="w-5 h-5" />}
                {step === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                <h2 className="text-base font-black uppercase tracking-wider">
                  {step === 'cart' && `Your Cart (${cart.reduce((a, c) => a + c.quantity, 0)})`}
                  {step === 'details' && 'Delivery Details'}
                  {step === 'success' && 'Order Placed!'}
                </h2>
              </div>
              <button onClick={handleClose} className="p-1 text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── STEP: CART ── */}
            {step === 'cart' && (
              <>
                {/* Shipping progress */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500">
                      {progress >= 100
                        ? '🎉 You qualify for FREE shipping!'
                        : `Add ${formatCurrency(freeShipRemaining)} more for free shipping`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.5 }}
                      className={cn('h-full rounded-full', progress >= 100 ? 'bg-green-500' : 'bg-[#FFE600]')}
                    />
                  </div>
                </div>

                {/* Cart items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                      <ShoppingBag className="w-16 h-16 mb-3" />
                      <p className="text-sm font-semibold">Your cart is empty</p>
                      <p className="text-xs mt-1 text-gray-400">Add some products to get started!</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                        <img src={item.image} alt={item.title} className="w-20 h-24 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold leading-snug line-clamp-2">{item.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Size: <span className="font-semibold text-gray-600">{item.size}</span></p>
                          <p className="text-sm font-black mt-1 text-black">{formatCurrency(item.price)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.productId, item.size)}
                              className="ml-auto p-1.5 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cart footer */}
                {cart.length > 0 && (
                  <div className="border-t border-gray-100 p-4 space-y-3 bg-white">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span className="font-semibold text-black">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Shipping</span>
                        <span className={cn('font-semibold', shipping === 0 ? 'text-green-600' : 'text-black')}>
                          {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-black pt-1 border-t border-gray-100 mt-1">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep('details')}
                      className="w-full bg-black text-white py-3.5 rounded-full text-sm font-black uppercase tracking-wider hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── STEP: CUSTOMER DETAILS ── */}
            {step === 'details' && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Order mini-summary */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Order Summary</p>
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate max-w-[65%]">{item.title} <span className="text-gray-400 text-xs">×{item.quantity} ({item.size})</span></span>
                        <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-black">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Delivery Information</p>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      <User className="w-3 h-3 inline mr-1" />Full Name *
                    </label>
                    <input
                      type="text"
                      value={info.name}
                      onChange={(e) => setInfo({ ...info, name: e.target.value })}
                      placeholder="Your full name"
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors',
                        errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-black bg-gray-50 focus:bg-white'
                      )}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      <Phone className="w-3 h-3 inline mr-1" />WhatsApp Number *
                    </label>
                    <div className="flex">
                      <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 font-semibold">+91</span>
                      <input
                        type="tel"
                        value={info.phone}
                        onChange={(e) => setInfo({ ...info, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="10-digit mobile number"
                        className={cn(
                          'flex-1 px-4 py-3 rounded-r-xl border text-sm outline-none transition-colors',
                          errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-black bg-gray-50 focus:bg-white'
                        )}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      <MapPin className="w-3 h-3 inline mr-1" />Street Address *
                    </label>
                    <textarea
                      value={info.address}
                      onChange={(e) => setInfo({ ...info, address: e.target.value })}
                      placeholder="House / Flat no., Street, Area"
                      rows={2}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors resize-none',
                        errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-black bg-gray-50 focus:bg-white'
                      )}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  {/* City + Pincode */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">City *</label>
                      <input
                        type="text"
                        value={info.city}
                        onChange={(e) => setInfo({ ...info, city: e.target.value })}
                        placeholder="City"
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors',
                          errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-black bg-gray-50 focus:bg-white'
                        )}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Pincode *</label>
                      <input
                        type="tel"
                        value={info.pincode}
                        onChange={(e) => setInfo({ ...info, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        placeholder="6-digit PIN"
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors',
                          errors.pincode ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-black bg-gray-50 focus:bg-white'
                        )}
                      />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    By placing an order, you&apos;ll be redirected to WhatsApp to confirm with ADIS Fashion. Your details are only used to process your order.
                  </p>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 space-y-3 bg-white">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={savingOrder}
                    className="w-full bg-[#25D366] text-white py-3.5 rounded-full text-sm font-black uppercase tracking-wider hover:bg-[#1db954] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200 disabled:opacity-60"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {savingOrder ? 'Saving Order…' : 'Place Order via WhatsApp'}
                  </button>
                  {currentUser && (
                    <p className="text-center text-xs text-gray-400">
                      ✓ Order will be saved to your account
                    </p>
                  )}
                  <button
                    onClick={() => setStep('cart')}
                    className="w-full text-gray-500 text-xs font-semibold py-2 hover:text-black transition-colors"
                  >
                    ← Back to Cart
                  </button>
                </div>
              </>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === 'success' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-black mb-2">Order Sent! 🎉</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                  Your order has been sent to ADIS Fashion via WhatsApp.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed mb-8">
                  We&apos;ll confirm your order on WhatsApp shortly at <span className="font-bold text-black">+91 {info.phone}</span>. Please keep your WhatsApp active.
                </p>
                <div className="w-full space-y-3">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white py-3.5 rounded-full text-sm font-black uppercase tracking-wider hover:bg-[#1db954] transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Open WhatsApp
                  </a>
                  <button
                    onClick={handleClose}
                    className="w-full bg-black text-white py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
