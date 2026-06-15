'use client';

import { useStore } from '@/store/useStore';
import { getFirebaseDB } from '@/lib/firebase';
import { ref, get, set, onValue } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MessageSquare, Send, Bot, ShoppingBag, Globe,
  ChevronDown, Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';

import {
  createInitialContext,
  processMessage,
  type ChatContext,
  type BotResponse,
  type Lang,
  t,
  handleLeadCaptureFlow,
} from '@/lib/chatEngine';

import ProductCards from '@/components/chat/ProductCards';
import OrderCard from '@/components/chat/OrderCard';
import CartSummaryCard from '@/components/chat/CartSummaryCard';
import PincodeResultCard from '@/components/chat/PincodeResultCard';
import SizeGuideCard from '@/components/chat/SizeGuideCard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  response?: BotResponse;
}

const LANG_FLAGS: Record<Lang, string> = { en: '🇬🇧', hi: '🇮🇳', mr: '🟠' };
const LANG_LABELS: Record<Lang, string> = { en: 'EN', hi: 'HI', mr: 'MR' };

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const {
    isChatOpen, setIsChatOpen,
    cart, products, currentUser, lastViewedProduct,
    setCartOpen,
  } = useStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatCtx, setChatCtx] = useState<ChatContext>(createInitialContext());
  const [input, setInput] = useState('');
  const [hasEngaged, setHasEngaged] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Mount ───────────────────────────────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Scroll button visibility ────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 120);
  }, []);

  // ── Focus input when chat opens ─────────────────────────────────────────────
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  // ── Welcome message on first open ──────────────────────────────────────────
  useEffect(() => {
    if (isChatOpen && !hasWelcomed) {
      setHasWelcomed(true);
      setTimeout(() => {
        if (!currentUser) {
          pushBotMessage({
            text: t(chatCtx.lang, 'ask_name'),
            quickReplies: [],
          });
          setChatCtx(prev => ({ ...prev, currentFlow: 'lead_capture', flowStep: 'ASK_NAME', pendingUser: {} }));
        } else {
          pushBotMessage({
            text: t(chatCtx.lang, 'greeting'),
            quickReplies: ['🔥 Best Sellers', '🆕 New Arrivals', '🎯 Style Quiz', '📦 Track Order', '🛒 My Cart'],
          });
        }
      }, 450);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen, hasWelcomed, currentUser]);

  // ── Cart abandonment ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isChatOpen && cart.length > 0 && !hasEngaged) {
      const timer = setTimeout(() => {
        pushBotMessage({
          text: t(chatCtx.lang, 'cart_abandon', { count: String(cart.length) }),
          quickReplies: ['🛒 Checkout Now', '🛍️ View Cart', '🔥 Keep Browsing'],
        });
        setHasEngaged(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen, cart.length]);

  // ── Proactive: last viewed product ─────────────────────────────────────────
  useEffect(() => {
    if (!hasEngaged && lastViewedProduct && !isChatOpen) {
      const timer = setTimeout(() => {
        setIsChatOpen(true);
        const product = products.find(p => p.id === lastViewedProduct);
        setTimeout(() => {
          pushBotMessage({
            text: product
              ? `Still eyeing the **${product.title}**? 👀 Want to know the price or add it to cart?`
              : `Still thinking? I can help you find your perfect fit! 👋`,
            quickReplies: ['💰 Show Price', '📐 Size Help', '🛒 Add to Cart', '🔥 Best Sellers'],
          });
        }, 500);
        setHasEngaged(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastViewedProduct, hasEngaged, isChatOpen]);

  // ── Idle timer ──────────────────────────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isChatOpen) {
      idleTimerRef.current = setTimeout(() => {
        pushBotMessage({
          text: t(chatCtx.lang, 'idle_nudge'),
          quickReplies: ['🔥 Best Sellers', '🎯 Style Quiz', '📐 Size Help'],
        });
      }, 30000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen, chatCtx.lang]);

  useEffect(() => {
    resetIdleTimer();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [isChatOpen, resetIdleTimer]);

  // ── Helper: push bot message ────────────────────────────────────────────────
  const pushBotMessage = useCallback((response: BotResponse) => {
    setMessages(prev => [...prev, {
      id: `bot-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: 'assistant',
      response,
    }]);
    if (!isChatOpen) setUnreadCount(c => c + 1);
  }, [isChatOpen]);

  // ── Listen for Admin Messages & Broadcasts ───────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vid = localStorage.getItem('ADIS_visitorId');
    if (!vid) return;

    let unsubscribeIndividual: (() => void) | undefined;
    let unsubscribeBroadcast: (() => void) | undefined;

    const handleIncomingMessage = (data: any, storageKey: string) => {
      if (!data) return;
      const msgBody = data.body || data.text;
      const msgTime = data.time || data.timestamp;
      const msgTitle = data.title || 'Store Admin';

      if (msgBody && msgTime) {
        const lastMsgTime = sessionStorage.getItem(storageKey);
        if (lastMsgTime !== String(msgTime)) {
          sessionStorage.setItem(storageKey, String(msgTime));
          
          // Trigger native device notification
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(msgTitle, {
                body: msgBody,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
              });
            } catch (e) {
              // Fallback for some mobile browsers that require Service Worker for notifications
              if (navigator.serviceWorker) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification(msgTitle, { body: msgBody, icon: '/favicon.ico' });
                });
              }
            }
          }

          pushBotMessage({
            text: `👤 **${msgTitle}:**\n${msgBody}`,
            quickReplies: ['💬 Reply to Admin']
          });
          setIsChatOpen(true);
        }
      }
    };

    const setupListener = async () => {
      try {
        const db = await getFirebaseDB();
        if (!db) return;
        
        // Listen to individual messages
        const msgRef = ref(db, `user_messages/${vid}/latest`);
        unsubscribeIndividual = onValue(msgRef, (snapshot) => {
          handleIncomingMessage(snapshot.val(), 'last_admin_msg_time');
        });

        // Listen to global broadcasts
        const broadcastRef = ref(db, 'admin_notifications/latest');
        unsubscribeBroadcast = onValue(broadcastRef, (snapshot) => {
          handleIncomingMessage(snapshot.val(), 'last_admin_broadcast_time');
        });

      } catch (err) {
        console.error('Error setting up admin message listener', err);
      }
    };

    setupListener();

    return () => {
      if (unsubscribeIndividual) unsubscribeIndividual();
      if (unsubscribeBroadcast) unsubscribeBroadcast();
    };
  }, [pushBotMessage, setIsChatOpen]);

  // ── Firebase helpers ────────────────────────────────────────────────────────
  const checkExistingUser = async (phone: string): Promise<boolean> => {
    try {
      const db = await getFirebaseDB();
      if (!db) return false;
      const snap = await get(ref(db, `customers/${phone}`));
      return snap.exists();
    } catch {
      return false;
    }
  };

  const saveNewUser = async (phone: string, name: string, password: string) => {
    try {
      const db = await getFirebaseDB();
      if (!db) return;
      await set(ref(db, `customers/${phone}`), {
        phone, name, password,
        createdAt: Date.now(),
      });
      // Push as a lead too
      const visitorId = localStorage.getItem('ADIS_visitorId') || '';
      const id = visitorId || `lead_${Date.now()}`;
      const newLead = { name, phone, email: '', visitorId, createdAt: new Date().toISOString() };
      await set(ref(db, `leads/${id}`), newLead);
      useStore.getState().addLead(newLead);
    } catch (e) {
      console.error('Firebase save error', e);
    }
  };

  // ── Main send handler ───────────────────────────────────────────────────────
  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const trimmed = text.trim();

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }]);
    setInput('');
    setIsLoading(true);
    resetIdleTimer();

    await new Promise(r => setTimeout(r, 550 + Math.random() * 350));

    try {
      // Async: lead capture phone lookup
      if (chatCtx.currentFlow === 'lead_capture' && chatCtx.flowStep === 'ASK_PHONE') {
        const phone = trimmed.replace(/[^0-9]/g, '');
        const exists = await checkExistingUser(phone);
        const { response, newCtx } = handleLeadCaptureFlow(
          'ASK_PHONE', trimmed, chatCtx, exists, chatCtx.pendingUser.pendingFlow ?? null
        );
        setChatCtx(prev => ({ ...prev, ...newCtx }));
        pushBotMessage(response);
        return;
      }

      // Async: save new user on password create or verify existing user
      if (chatCtx.currentFlow === 'lead_capture' && (chatCtx.flowStep === 'ASK_PASSWORD' || chatCtx.flowStep === 'VERIFY_PASSWORD')) {
        const phone = chatCtx.pendingUser.phone ?? '';
        const name = chatCtx.pendingUser.name ?? 'Friend';
        const password = trimmed;

        if (chatCtx.flowStep === 'ASK_PASSWORD') {
          await saveNewUser(phone, name, password);
          // Auto-login newly created user
          useStore.getState().login({ phone, name });
        } else if (chatCtx.flowStep === 'VERIFY_PASSWORD') {
          try {
            const db = await getFirebaseDB();
            if (db) {
              const snap = await get(ref(db, `customers/${phone}`));
              const data = snap.val();
              if (data && data.password === password) {
                // Auto-login existing user
                useStore.getState().login({
                  phone,
                  name: data.name || name,
                  email: data.email || '',
                });
              } else {
                pushBotMessage({ text: "Incorrect password. Please try again.", quickReplies: [] });
                return;
              }
            }
          } catch (e) {
            console.error("Verification error", e);
            pushBotMessage({ text: "Error verifying password. Please try again.", quickReplies: [] });
            return;
          }
        }

        const { response, newCtx } = handleLeadCaptureFlow(
          chatCtx.flowStep, trimmed, chatCtx, false, chatCtx.pendingUser.pendingFlow ?? null
        );
        setChatCtx(prev => ({ ...prev, ...newCtx }));
        pushBotMessage(response);
        return;
      }

      // Standard sync processing
      const { response, newCtx } = processMessage(
        trimmed, chatCtx, products, cart, !!currentUser, checkExistingUser,
      );
      setChatCtx(newCtx);
      pushBotMessage(response);

    } catch (err) {
      console.error('[ChatWidget]', err);
      pushBotMessage({ text: 'Oops! Something went wrong. Please try again.', quickReplies: ['🔥 Best Sellers'] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleChipClick = (chip: string) => {
    const lower = chip.toLowerCase();
    if (lower.includes('view cart') || lower === '🛍️ view cart') {
      setCartOpen(true);
      return;
    }
    handleSend(chip);
  };

  const handleProductClick = (productId: string) => {
    setChatCtx(prev => ({ ...prev, lastProduct: productId }));
    const product = products.find(p => p.id === productId);
    if (product) {
      pushBotMessage({
        text: `📋 **${product.title}**\n• Price: ₹${product.prices.sale} (MRP ₹${product.prices.base})\n• Member Price: ₹${product.prices.member}\n• Material: ${product.details.material}\n• GSM: ${product.details.gsm}\n• Wash: ${product.details.wash_care}`,
        quickReplies: ['📐 Size Help', '🛒 Checkout', '🔥 Best Sellers'],
      });
    }
  };

  // ── Widget renderer ─────────────────────────────────────────────────────────
  const renderWidget = (response: BotResponse) => {
    if (!response.widget) return null;
    switch (response.widget) {
      case 'ProductCards':
        return <ProductCards products={(response.widgetData as any[]) ?? []} onProductClick={handleProductClick} />;
      case 'OrderCard':
        return <OrderCard data={response.widgetData as any} />;
      case 'CartSummary':
        return (
          <CartSummaryCard
            cart={(response.widgetData as any).cart}
            products={(response.widgetData as any).products}
            onCheckout={() => handleSend('checkout')}
          />
        );
      case 'PincodeResult':
        return <PincodeResultCard data={response.widgetData as any} />;
      case 'SizeGuide':
        return <SizeGuideCard />;
      default:
        return null;
    }
  };

  // ── Markdown renderer ───────────────────────────────────────────────────────
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|~~[^~]+~~|\n)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('~~') && part.endsWith('~~')) return <span key={i} className="line-through text-gray-400">{part.slice(2, -2)}</span>;
      if (part === '\n') return <br key={i} />;
      return <span key={i}>{part}</span>;
    });
  };

  // ── Placeholder ─────────────────────────────────────────────────────────────
  const getPlaceholder = (): string => {
    if (chatCtx.currentFlow === 'lead_capture') {
      if (chatCtx.flowStep === 'ASK_PHONE') return 'Enter your 10-digit phone number...';
      if (chatCtx.flowStep === 'ASK_NAME') return 'Enter your full name...';
      if (chatCtx.flowStep === 'ASK_PASSWORD' || chatCtx.flowStep === 'VERIFY_PASSWORD') return 'Enter password (min 6 chars)...';
    }
    if (chatCtx.currentFlow === 'checkout' && chatCtx.flowStep === 'ASK_ADDRESS')
      return 'Full address with city & pincode...';
    const map: Record<Lang, string> = {
      en: 'Ask about sizes, styles, or type "help"...',
      hi: 'साइज़, स्टाइल पूछें या "help" टाइप करें...',
      mr: 'साइज़, स्टाइल विचारा किंवा "help" टाइप करा...',
    };
    return map[chatCtx.lang] ?? map.en;
  };

  if (!mounted) return null;

  const totalCartQty = cart.reduce((s, c) => s + c.quantity, 0);
  // Index of the last assistant message — only that one shows quick replies
  const lastBotIdx = messages.map((m, i) => m.role === 'assistant' ? i : -1).filter(i => i >= 0).at(-1) ?? -1;

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Action Buttons ── */}
      <div className="fixed bottom-[90px] right-4 sm:bottom-6 sm:right-6 flex flex-col gap-3 z-50">
        {/* Cart FAB */}
        <motion.button
          aria-label="Open cart"
          className="w-11 h-11 sm:w-12 sm:h-12 bg-white border border-gray-200 text-black rounded-full flex items-center justify-center shadow-lg relative"
          onClick={() => setCartOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
        >
          <ShoppingBag size={18} />
          <AnimatePresence>
            {totalCartQty > 0 && (
              <motion.span
                key="cart-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full"
              >
                {totalCartQty}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Chat FAB */}
        <motion.button
          aria-label="Open chat"
          className="w-13 h-13 sm:w-14 sm:h-14 w-[52px] h-[52px] bg-black text-[#FFE600] rounded-full flex items-center justify-center shadow-2xl relative"
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            // Request push notification permission on user gesture
            if (!isChatOpen && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
              Notification.requestPermission().catch(() => {});
            }
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <AnimatePresence mode="wait">
            {isChatOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageSquare size={22} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isChatOpen && unreadCount > 0 && (
              <motion.span
                key="unread"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.3, 1] }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.93 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            // Mobile: full-width with small margin. Desktop: fixed 400px
            className="fixed z-[60] flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-gray-100 bg-white
                       bottom-[90px] left-2 right-2
                       sm:bottom-24 sm:left-auto sm:right-6 sm:w-[400px]
                       h-[520px] max-h-[calc(100dvh-100px)] sm:max-h-[calc(100dvh-120px)]"
          >
            {/* ── Header ── */}
            <div className="bg-black px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#FFE600] flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-black" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-black rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-black uppercase tracking-widest text-[11px]">ADIS Fashion AI</h3>
                <p className="text-green-400 text-[10px] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  Online · Replies instantly
                </p>
              </div>

              <div className="flex items-center gap-1 mr-1">
                <Globe size={9} className="text-gray-500" />
                <span className="text-gray-400 text-[10px] font-mono">
                  {LANG_FLAGS[chatCtx.lang]} {LANG_LABELS[chatCtx.lang]}
                </span>
              </div>

              <button
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={13} className="text-white" />
              </button>
            </div>

            {/* ── Messages Area ── */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 bg-gray-50 flex flex-col gap-3"
            >
              {/* Empty state */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                    <Sparkles size={26} className="text-[#FFE600]" />
                  </div>
                  <div>
                    <h4 className="font-black text-base text-gray-900">Hey there! 👋</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
                      I'm ADIS Fashion AI — your style assistant. Ask me anything!
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['🔥 Best Sellers', '🆕 New Drops', '📐 Size Help', '🎯 Style Quiz'].map(chip => (
                      <button
                        key={chip}
                        onClick={() => handleChipClick(chip)}
                        className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full font-semibold text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all active:scale-95"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages list */}
              {messages.map((msg, msgIdx) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-black flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot size={11} className="text-[#FFE600]" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 min-w-0" style={{ maxWidth: msg.role === 'user' ? '78%' : '88%' }}>
                    {/* Text bubble */}
                    {(msg.text || msg.response?.text) && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                          msg.role === 'user'
                            ? 'bg-black text-white rounded-tr-sm'
                            : 'bg-white text-gray-900 border border-gray-100 shadow-sm rounded-tl-sm'
                        }`}
                      >
                        {renderText(msg.text ?? msg.response?.text ?? '')}
                      </motion.div>
                    )}

                    {/* Widget */}
                    {msg.role === 'assistant' && msg.response && renderWidget(msg.response)}

                    {/* Quick replies — ONLY on last bot message */}
                    {msg.role === 'assistant' && msgIdx === lastBotIdx &&
                      msg.response?.quickReplies && msg.response.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {msg.response.quickReplies.map((qr, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.88 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => handleChipClick(qr)}
                            className="text-[11px] px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-black hover:text-[#FFE600] transition-all border border-transparent hover:border-black active:scale-95 whitespace-nowrap"
                          >
                            {qr}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex gap-2 justify-start"
                  >
                    <div className="w-6 h-6 rounded-full bg-black flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot size={11} className="text-[#FFE600]" />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gray-300 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* ── Scroll to bottom button ── */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="absolute bottom-[120px] left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10"
                >
                  <ChevronDown size={10} /> Latest message
                </motion.button>
              )}
            </AnimatePresence>

            {/* ── Persistent Cart Checkout Bar ── */}
            <AnimatePresence>
              {cart.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3 py-2 bg-white border-t border-gray-100 flex-shrink-0 overflow-hidden"
                >
                  <button
                    onClick={() => handleSend('checkout')}
                    className="w-full text-xs bg-[#FFE600] text-black font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-300 active:scale-[0.98] transition-all"
                  >
                    <ShoppingBag size={13} />
                    Complete Your Order · {cart.length} item{cart.length > 1 ? 's' : ''}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input Area ── */}
            <form
              onSubmit={handleSubmit}
              className="px-3 pb-3 pt-2 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0"
            >
              <input
                ref={inputRef}
                type={(chatCtx.flowStep === 'ASK_PASSWORD' || chatCtx.flowStep === 'VERIFY_PASSWORD') ? 'password' : 'text'}
                className="flex-1 bg-gray-100 text-black text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-black/20 transition-all placeholder:text-gray-400 min-w-0"
                value={input}
                placeholder={getPlaceholder()}
                onChange={e => setInput(e.target.value)}
                onKeyDown={resetIdleTimer}
                disabled={isLoading}
                autoComplete="off"
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                whileTap={{ scale: 0.88 }}
              >
                <Send size={14} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
