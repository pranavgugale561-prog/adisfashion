'use client';

import { useStore } from '@/store/useStore';
import { getFirebaseDB } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, Bot, Package, Ruler, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  widget?: 'TopPicks' | 'TrackOrder' | 'StyleProfile';
};

const DEFAULT_OPTIONS = ["🔥 Best Sellers", "📐 Find My Size", "📦 Track My Order"];

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const { isChatOpen, setIsChatOpen, cart, lastViewedProduct, setCartOpen } = useStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatStep, setChatStep] = useState<'auth' | 'ask_name' | 'ask_email' | 'main'>('auth');
  const [tempPhone, setTempPhone] = useState('');
  const [tempName, setTempName] = useState('');
  const [currentOptions, setCurrentOptions] = useState<string[]>(["Skip for now"]);
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasEngaged, setHasEngaged] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Proactive Engagement
  useEffect(() => {
    if (!hasEngaged && lastViewedProduct) {
      const timer = setTimeout(() => {
        setIsChatOpen(true);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Still looking for the perfect fit? Let's narrow it down!",
        }]);
        setHasEngaged(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [lastViewedProduct, hasEngaged, setIsChatOpen]);

  const processUserMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate short network delay for UI feel
    await new Promise(r => setTimeout(r, 800));

    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "" };
    let nextOptions = DEFAULT_OPTIONS;
    const lowerText = text.toLowerCase();
    
    try {
      if (chatStep === 'auth') {
        if (lowerText.includes("skip")) {
          botMsg.content = "No problem! What can I help you with today?";
          setChatStep('main');
        } else {
          // Assume text is a phone number
          const db = await getFirebaseDB();
          if (db) {
            const userRef = ref(db, `customers/${text.replace(/[^0-9]/g, '')}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
              const userData = snapshot.val();
              botMsg.content = `Welcome back, ${userData.name || 'friend'}! What can I help you with today?`;
              setChatStep('main');
            } else {
              botMsg.content = "Looks like you're new here! What is your full name?";
              setTempPhone(text.replace(/[^0-9]/g, ''));
              setChatStep('ask_name');
              nextOptions = [];
            }
          } else {
            botMsg.content = "Failed to connect to database. What can I help you with?";
            setChatStep('main');
          }
        }
      } else if (chatStep === 'ask_name') {
        botMsg.content = `Nice to meet you, ${text}! Lastly, what is your email address?`;
        setTempName(text);
        setChatStep('ask_email');
        nextOptions = [];
      } else if (chatStep === 'ask_email') {
        const db = await getFirebaseDB();
        if (db) {
          const userRef = ref(db, `customers/${tempPhone}`);
          await set(userRef, { name: tempName, email: text, phone: tempPhone, createdAt: Date.now() });
        }
        botMsg.content = `Thanks ${tempName}! Your account is all set up. What can I help you with today?`;
        setChatStep('main');
      } else {
        if (lowerText.includes("best sellers") || lowerText.includes("picks")) {
          botMsg.content = "Here are some top picks you might like:";
          botMsg.widget = 'TopPicks';
        } else if (lowerText.includes("find my size") || lowerText.includes("size")) {
          botMsg.content = "Let's find your perfect fit! Are you looking for Men's or Women's?";
          nextOptions = ["Men's", "Women's"];
        } else if (lowerText === "men's" || lowerText === "women's") {
          botMsg.content = "What's your preferred fit?";
          nextOptions = ["Slim Fit", "Regular Fit", "Oversized"];
        } else if (lowerText === "slim fit" || lowerText === "regular fit" || lowerText === "oversized") {
          botMsg.content = "Great! Your style profile is saved.";
          botMsg.widget = 'StyleProfile';
        } else if (lowerText.includes("track my order") || lowerText.includes("track")) {
          botMsg.content = "Here's the latest update on your recent order:";
          botMsg.widget = 'TrackOrder';
        } else {
          botMsg.content = "I'm a simple assistant right now! Please choose one of the options below.";
        }
      }
    } catch (e) {
      console.error(e);
      botMsg.content = "Sorry, something went wrong processing your request.";
      setChatStep('main');
    }
    
    setIsLoading(false);
    setMessages(prev => [...prev, botMsg]);
    setCurrentOptions(nextOptions);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    processUserMessage(input);
    setInput('');
  };

  const handleChipClick = (chip: string) => {
    if (chip.includes("Checkout")) {
      window.location.href = '/checkout';
    } else {
      processUserMessage(chip);
    }
  };

  const cartChips = cart.length > 0 ? ["🛍️ Checkout My Cart (10% Off Applied!)"] : [];
  const chipsToDisplay = [...cartChips, ...currentOptions];

  if (!mounted) return null;

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        {!isChatOpen && (
          <motion.button
            className="w-14 h-14 bg-white border border-gray-200 text-black rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform relative"
            onClick={() => setCartOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ShoppingBag size={24} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </motion.button>
        )}

        <motion.button
          className="w-14 h-14 bg-black text-[#FFE600] rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
          onClick={() => setIsChatOpen(!isChatOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-black p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFE600] flex items-center justify-center">
                <Bot size={20} className="text-black" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-wider text-sm">VibeStylist</h3>
                <p className="text-gray-400 text-xs">Usually replies instantly</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">✨</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Welcome!</h4>
                    <p className="text-sm text-gray-500 max-w-[250px] mx-auto">
                      Please enter your registered phone number to manage your orders & payment history.
                    </p>
                  </div>
                </div>
              )}

              {messages.map(m => (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-black flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot size={14} className="text-[#FFE600]" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col gap-2 max-w-[80%]`}>
                    {m.content && (
                      <div className={`p-3 rounded-2xl text-sm ${
                        m.role === 'user' 
                          ? 'bg-black text-white rounded-tr-sm' 
                          : 'bg-white text-black border border-gray-100 shadow-sm rounded-tl-sm'
                      }`}>
                        {m.content}
                      </div>
                    )}
                    
                    {/* Render predefined widgets based on bot state */}
                    {m.widget === 'TopPicks' && (
                      <div className="bg-white text-black border border-gray-200 rounded-xl p-4 shadow-sm w-full">
                        <h4 className="font-bold text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                          <span className="text-[#FFE600]">🔥</span> Top Picks
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 text-center text-xs text-gray-500">
                          Based on recent trends and best sellers.
                          <br/><Link href="/men" className="text-black font-bold mt-2 inline-block underline">View Full Collection →</Link>
                        </div>
                      </div>
                    )}
                    
                    {m.widget === 'TrackOrder' && (
                      <div className="bg-white text-black border border-gray-200 rounded-xl p-4 shadow-sm w-full">
                        <div className="flex items-center gap-2 mb-3 text-black">
                          <Package size={16} />
                          <h4 className="font-bold text-sm uppercase tracking-wide">Order #AD-83921</h4>
                        </div>
                        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                           <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                             <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-black text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                                <div className="w-2 h-2 bg-[#FFE600] rounded-full"></div>
                             </div>
                             <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-2 rounded border border-slate-200 bg-white shadow">
                                <div className="font-bold text-xs">Out for delivery</div>
                             </div>
                           </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 pt-3 border-t">
                          Expected: <span className="font-bold text-black">Today by 8:00 PM</span>
                        </div>
                      </div>
                    )}
                    
                    {m.widget === 'StyleProfile' && (
                      <div className="bg-black text-white rounded-xl p-4 shadow-sm w-full">
                        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                          <Ruler size={16} className="text-[#FFE600]"/> Profile Saved
                        </h4>
                        <p className="text-xs text-gray-300">Your style profile has been saved. We'll use this to tailor recommendations just for you.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-black flex-shrink-0 flex items-center justify-center">
                    <Bot size={14} className="text-[#FFE600]" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-gray-100 flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Dynamic Buttons (Suggestions) */}
            {!isLoading && (
              <div className="p-3 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {chipsToDisplay.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleChipClick(chip)}
                    className={`text-xs px-4 py-2 rounded-full font-semibold transition-colors ${
                      chip.includes('Checkout') 
                        ? 'bg-[#FFE600] text-black hover:bg-yellow-400' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 flex gap-2">
              <input
                className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-black transition-all"
                value={input}
                placeholder={
                  chatStep === 'auth' ? "Enter your phone number..." : 
                  chatStep === 'ask_name' ? "Enter your full name..." :
                  chatStep === 'ask_email' ? "Enter your email address..." :
                  "Ask about sizes, fits, or styles..."
                }
                onChange={handleInputChange}
              />
              <button 
                type="submit"
                disabled={!(input || '').trim() || isLoading}
                className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
