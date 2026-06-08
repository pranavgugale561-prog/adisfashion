/**
 * ADIS Fashion — Rules-Based Chat Engine
 * Pure logic module — no React, no side-effects.
 * All state is passed in and returned as new objects.
 */

import type { Product, CartItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Lang = 'en' | 'hi' | 'mr';

export type Flow =
  | null
  | 'checkout'
  | 'style_quiz'
  | 'lead_capture';

export type FlowStep =
  // Checkout
  | 'ASK_ADDRESS'
  | 'ASK_PAYMENT'
  // Style Quiz
  | 'ASK_OCCASION'
  | 'ASK_FIT'
  | 'ASK_FANDOM'
  | 'ASK_BUDGET'
  // Lead / Auth
  | 'ASK_PHONE'
  | 'ASK_NAME'
  | 'ASK_PASSWORD'
  | 'VERIFY_PASSWORD'
  | null;

export type Intent =
  | 'GREETING'
  | 'FAREWELL'
  | 'HELP'
  | 'CART_SUMMARY'
  | 'CHECKOUT'
  | 'PRICE_QUERY'
  | 'MATERIAL_QUERY'
  | 'SIZE_HELP'
  | 'TRACK_ORDER'
  | 'PINCODE_CHECK'
  | 'BESTSELLERS'
  | 'NEW_ARRIVALS'
  | 'FANDOM_QUERY'
  | 'STYLE_QUIZ'
  | 'WISHLIST'
  | 'OFFER_QUERY'
  | 'RETURN_POLICY'
  | 'MEMBERSHIP'
  | 'CONTACT_SUPPORT'
  | 'UNKNOWN';

export interface PendingUser {
  phone?: string;
  name?: string;
  pendingFlow?: Flow; // flow to resume after auth
}

export interface ChatContext {
  currentFlow: Flow;
  flowStep: FlowStep;
  lastProduct: string | null;  // product id
  lastTopic: string | null;
  history: Array<{ role: 'user' | 'assistant'; text: string }>;
  lang: Lang;
  pendingUser: PendingUser;
  // Style quiz accumulator
  quizAnswers: {
    occasion?: string;
    fit?: string;
    fandom?: string;
    budget?: string;
  };
  // Checkout accumulator
  orderData: {
    address?: string;
    payment?: string;
  };
}

export type WidgetType =
  | 'ProductCards'
  | 'OrderCard'
  | 'CartSummary'
  | 'StyleProfile'
  | 'PincodeResult'
  | 'SizeGuide';

export interface BotResponse {
  text?: string;
  widget?: WidgetType;
  widgetData?: unknown;
  quickReplies?: string[];
}

// ─── Initial Context ──────────────────────────────────────────────────────────

export function createInitialContext(): ChatContext {
  return {
    currentFlow: null,
    flowStep: null,
    lastProduct: null,
    lastTopic: null,
    history: [],
    lang: 'en',
    pendingUser: {},
    quizAnswers: {},
    orderData: {},
  };
}

// ─── Language Detection ───────────────────────────────────────────────────────

const LANG_PATTERNS: Record<Lang, string[]> = {
  hi: [
    'नमस्ते', 'क्या', 'हाँ', 'नहीं', 'कैसे', 'मुझे', 'चाहिए', 'कितना', 'दिखाओ',
    'खरीदना', 'भेजो', 'ऑर्डर', 'पता', 'रोकू', 'धन्यवाद', 'ठीक', 'बताओ',
  ],
  mr: [
    'नमस्कार', 'काय', 'हो', 'नाही', 'कसे', 'मला', 'हवे', 'किती', 'दाखवा',
    'विकत', 'घ्यायचे', 'ऑर्डर', 'पत्ता', 'आभारी', 'धन्यवाद', 'बरं',
  ],
  en: [],
};

export function detectLanguage(text: string): Lang {
  for (const [lang, keywords] of Object.entries(LANG_PATTERNS)) {
    if (lang === 'en') continue;
    for (const kw of keywords) {
      if (text.includes(kw)) return lang as Lang;
    }
  }
  return 'en';
}

// ─── Translations ─────────────────────────────────────────────────────────────

type I18nKey =
  | 'greeting'
  | 'farewell'
  | 'help_menu'
  | 'ask_address'
  | 'ask_payment'
  | 'order_confirmed'
  | 'empty_cart'
  | 'unknown'
  | 'ask_phone'
  | 'ask_name'
  | 'ask_password_new'
  | 'ask_password_existing'
  | 'welcome_back'
  | 'registered'
  | 'cart_abandon'
  | 'idle_nudge'
  | 'contact_support';

const I18N: Record<Lang, Record<I18nKey, string>> = {
  en: {
    greeting: "Welcome to ADIS Fashion. I am your virtual assistant. How may I assist you today?",
    farewell: "Thank you for shopping with ADIS Fashion. Have a wonderful day.",
    help_menu: "Please select an option below so I may assist you:",
    ask_address: "Please provide your complete delivery address, including city and pincode.",
    ask_payment: "Please select your preferred payment method: Cash on Delivery (COD) or Online Payment (Razorpay).",
    order_confirmed: "Your order has been placed successfully. Your order ID is #{orderId}. You will receive a confirmation shortly.",
    empty_cart: "Your cart is currently empty. Let me assist you in finding our products.",
    unknown: "I apologize, but I did not understand your request. Please ask about our products, sizing, or type 'help' to view all options.",
    ask_phone: "Please enter your 10-digit phone number to proceed:",
    ask_name: "Please provide your full name to begin:",
    ask_password_new: "Please create a password (minimum 6 characters) to complete your account registration and secure your order history:",
    ask_password_existing: "Welcome back. Please enter your password to sign in:",
    welcome_back: "Welcome back, {name}. How may I assist you today?",
    registered: "Your account has been successfully created. Welcome to ADIS Fashion, {name}.",
    cart_abandon: "You currently have {count} item(s) in your cart. Would you like assistance in completing your purchase?",
    idle_nudge: "If you require further assistance with sizes, styles, or trending items, please let me know.",
    contact_support: `**Contact Support:**\n• Phone: +91 88884 05282\n• Hours: Open Daily: 10:00 AM - 9:00 PM\n• Address: Munot Chambers, Navipeth Road, Nalegaon, Ahmednagar - 414001, Maharashtra, India`,
  },
  hi: {
    greeting: "ADIS Fashion में आपका स्वागत है। मैं आपका वर्चुअल असिस्टेंट हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
    farewell: "ADIS Fashion से खरीदारी के लिए धन्यवाद। आपका दिन शुभ हो।",
    help_menu: "कृपया नीचे दिए गए विकल्पों में से चुनें:",
    ask_address: "कृपया शहर और पिनकोड सहित अपना पूरा डिलीवरी पता प्रदान करें।",
    ask_payment: "कृपया अपनी भुगतान विधि चुनें: कैश ऑन डिलीवरी (COD) या ऑनलाइन (Razorpay)।",
    order_confirmed: "आपका ऑर्डर सफलतापूर्वक रखा गया है। आपका ऑर्डर ID #{orderId} है। आपको जल्द ही पुष्टि प्राप्त होगी।",
    empty_cart: "आपका कार्ट वर्तमान में खाली है। उत्पादों को खोजने में मैं आपकी सहायता कर सकता हूँ।",
    unknown: "क्षमा करें, मुझे समझ नहीं आया। कृपया हमारे उत्पादों, आकार के बारे में पूछें या सभी विकल्प देखने के लिए 'help' टाइप करें।",
    ask_phone: "आगे बढ़ने के लिए कृपया अपना 10-अंकीय फ़ोन नंबर दर्ज करें:",
    ask_name: "शुरू करने के लिए कृपया अपना पूरा नाम प्रदान करें:",
    ask_password_new: "अपना खाता पंजीकरण पूरा करने और अपनी ऑर्डर हिस्ट्री सुरक्षित करने के लिए कृपया एक पासवर्ड (न्यूनतम 6 अक्षर) बनाएं:",
    ask_password_existing: "वापसी पर स्वागत है। कृपया साइन इन करने के लिए अपना पासवर्ड दर्ज करें:",
    welcome_back: "वापसी पर स्वागत है, {name}। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
    registered: "आपका खाता सफलतापूर्वक बना लिया गया है। ADIS Fashion में आपका स्वागत है, {name}।",
    cart_abandon: "आपके कार्ट में वर्तमान में {count} आइटम हैं। क्या आप अपनी खरीदारी पूरी करने में सहायता चाहेंगे?",
    idle_nudge: "यदि आपको आकार, शैली या ट्रेंडिंग आइटम के संबंध में और सहायता चाहिए, तो कृपया मुझे बताएं।",
    contact_support: `**संपर्क करें:**\n• फ़ोन: +91 88884 05282\n• समय: सुबह 10:00 - रात 9:00 (प्रतिदिन)\n• पता: मुनोत चैंबर्स, नवीपेठ रोड, नालेगांव, अहमदनगर - 414001, महाराष्ट्र`,
  },
  mr: {
    greeting: "ADIS Fashion मध्ये आपले स्वागत आहे. मी तुमचा व्हर्च्युअल असिस्टंट आहे. आज मी तुमची कशी मदत करू शकतो?",
    farewell: "ADIS Fashion वर खरेदी केल्याबद्दल धन्यवाद. आपला दिवस चांगला जावो.",
    help_menu: "कृपया खालील पर्यायांपैकी एक निवडा:",
    ask_address: "कृपया शहर आणि पिनकोडसह आपला संपूर्ण डिलिव्हरी पत्ता द्या.",
    ask_payment: "कृपया तुमची पेमेंट पद्धत निवडा: कॅश ऑन डिलिव्हरी (COD) किंवा ऑनलाइन (Razorpay).",
    order_confirmed: "तुमची ऑर्डर यशस्वीरित्या नोंदवली गेली आहे. तुमचा ऑर्डर ID #{orderId} आहे. तुम्हाला लवकरच पुष्टी मिळेल.",
    empty_cart: "तुमची कार्ट सध्या रिकामी आहे. आमची उत्पादने शोधण्यात मी तुमची मदत करू शकतो.",
    unknown: "क्षमस्व, मला समजले नाही. कृपया आमची उत्पादने, आकार किंवा सर्व पर्याय पाहण्यासाठी 'help' टाइप करा.",
    ask_phone: "पुढे जाण्यासाठी कृपया तुमचा 10 अंकी फोन नंबर प्रविष्ट करा:",
    ask_name: "सुरू करण्यासाठी कृपया तुमचे पूर्ण नाव द्या:",
    ask_password_new: "तुमची खाते नोंदणी पूर्ण करण्यासाठी आणि तुमची ऑर्डर हिस्ट्री सुरक्षित करण्यासाठी कृपया पासवर्ड (किमान 6 अक्षरे) तयार करा:",
    ask_password_existing: "पुन्हा स्वागत आहे. कृपया साइन इन करण्यासाठी तुमचा पासवर्ड प्रविष्ट करा:",
    welcome_back: "पुन्हा स्वागत आहे, {name}. आज मी तुमची कशी मदत करू शकतो?",
    registered: "तुमचे खाते यशस्वीरित्या तयार केले गेले आहे. ADIS Fashion मध्ये आपले स्वागत आहे, {name}.",
    cart_abandon: "तुमच्या कार्टमध्ये सध्या {count} आयटम आहेत. तुम्हाला तुमची खरेदी पूर्ण करण्यात मदत हवी आहे का?",
    idle_nudge: "तुम्हाला आकार, शैली किंवा ट्रेंडिंग आयटमबाबत अधिक मदत हवी असल्यास, कृपया मला कळवा.",
    contact_support: `**संपर्क करा:**\n• फोन: +91 88884 05282\n• वेळ: सकाळी 10:00 - रात्री 9:00 (दररोज)\n• पत्ता: मुनोत चेंबर, नवी पेठ रोड, नालेगाव, अहमदनगर - 414001, महाराष्ट्र`,
  },
};

export function t(lang: Lang, key: I18nKey, vars?: Record<string, string>): string {
  let str = I18N[lang]?.[key] ?? I18N['en'][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}

// ─── Intent Patterns ──────────────────────────────────────────────────────────

const INTENT_PATTERNS: Array<{ intent: Intent; patterns: Array<string | RegExp> }> = [
  {
    intent: 'GREETING',
    patterns: [/^(hi|hello|hey|yo|sup|good\s*(morning|evening|afternoon))/, 'namaste', 'नमस्ते', 'नमस्कार', 'hii', 'helo'],
  },
  {
    intent: 'FAREWELL',
    patterns: ['bye', 'goodbye', 'thanks', 'thank you', 'tata', 'ok bye', 'tc', 'take care', 'dhanyawad', 'धन्यवाद'],
  },
  {
    intent: 'HELP',
    patterns: ['help', 'menu', 'options', 'what can you do', 'commands', 'kya kar sakte'],
  },
  {
    intent: 'BESTSELLERS',
    patterns: ['best seller', 'bestseller', 'trending', 'popular', 'top picks', 'most sold', 'hit', 'famous', 'hot', 'viral'],
  },
  {
    intent: 'NEW_ARRIVALS',
    patterns: ['new', 'latest', 'fresh', 'just dropped', 'new arrivals', 'naya', 'new launch', 'naye'],
  },
  {
    intent: 'PRICE_QUERY',
    patterns: ['price', 'cost', 'how much', 'kitna', 'rate', 'pricing', 'daam', 'paisa', 'कितना', 'rs', '₹'],
  },
  {
    intent: 'MATERIAL_QUERY',
    patterns: ['material', 'fabric', 'gsm', 'cotton', 'polyester', 'quality', 'cloth', 'kapda', 'wash', 'care'],
  },
  {
    intent: 'SIZE_HELP',
    patterns: ['size', 'sizing', 'fit', 'measurement', 'size chart', 'naap', 'fitting', 'xl', 'small', 'medium', 'large'],
  },
  {
    intent: 'CART_SUMMARY',
    patterns: ['cart', 'bag', 'my items', 'what did i add', 'kya hai cart', 'show cart', 'basket'],
  },
  {
    intent: 'CHECKOUT',
    patterns: ['checkout', 'buy', 'purchase', 'order', 'order karna', 'place order', 'buy now', 'kharidna'],
  },
  {
    intent: 'TRACK_ORDER',
    patterns: ['track', 'tracking', 'where is my order', 'delivery status', 'shipment', 'dispatch', 'awb'],
  },
  {
    intent: 'OFFER_QUERY',
    patterns: ['offer', 'discount', 'coupon', 'promo', 'sale', 'deal', 'chhutt', 'off', 'code'],
  },
  {
    intent: 'RETURN_POLICY',
    patterns: ['return', 'refund', 'exchange', 'policy', 'wapas', 'replace', 'cancel'],
  },
  {
    intent: 'MEMBERSHIP',
    patterns: ['member', 'membership', 'vip', 'premium', 'club', 'subscribe'],
  },
  {
    intent: 'CONTACT_SUPPORT',
    patterns: ['contact support', 'support', 'help desk', 'customer care', 'contact', 'call', 'phone number'],
  },
  {
    intent: 'STYLE_QUIZ',
    patterns: ['suggest', 'recommend', 'kya pehnu', 'what to wear', 'style', 'outfit', 'help me choose', 'pick for me', 'quiz'],
  },
  {
    intent: 'FANDOM_QUERY',
    patterns: ['marvel', 'anime', 'dc', 'naruto', 'batman', 'spider', 'avengers', 'dragon ball', 'dbz', 'one piece', 'attack on titan', 'aot', 'joker', 'superman', 'rick', 'morty'],
  },
  {
    intent: 'WISHLIST',
    patterns: ['wishlist', 'wish list', 'saved', 'favourite', 'favorite', 'liked'],
  },
];

export function classifyIntent(text: string): Intent {
  const lower = text.toLowerCase().trim();

  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (typeof pattern === 'string') {
        if (lower.includes(pattern)) return intent;
      } else {
        if (pattern.test(lower)) return intent;
      }
    }
  }
  return 'UNKNOWN';
}

// ─── Style Map (fashion equivalent of SYMPTOM_MAP) ────────────────────────────

export interface StyleMapEntry {
  label: string;
  filterFn: (p: Product) => boolean;
}

const STYLE_MAP: Record<string, StyleMapEntry> = {
  gym: {
    label: 'Gym & Workout',
    filterFn: (p) => p.category === 'Sneakers' || (p.category === 'Daily Wear' && (p.fit_type === 'Slim' || p.id.includes('track') || p.id.includes('jogger'))),
  },
  workout: {
    label: 'Gym & Workout',
    filterFn: (p) => p.category === 'Sneakers' || p.id.includes('track') || p.id.includes('jogger'),
  },
  office: {
    label: 'Office & Formal',
    filterFn: (p) => p.fit_type === 'Slim' || p.id.includes('polo'),
  },
  formal: {
    label: 'Office & Formal',
    filterFn: (p) => p.fit_type === 'Slim' || p.id.includes('polo'),
  },
  casual: {
    label: 'Casual & Everyday',
    filterFn: (p) => p.fit_type === 'Oversized' || p.category === 'Daily Wear',
  },
  chill: {
    label: 'Casual Chill',
    filterFn: (p) => p.fit_type === 'Oversized' || p.id.includes('hoodie'),
  },
  party: {
    label: 'Party & Night Out',
    filterFn: (p) => p.badges.includes('BESTSELLER') || p.fit_type === 'Slim',
  },
  gift: {
    label: 'Gift Ideas',
    filterFn: (p) => p.badges.includes('BESTSELLER') || p.badges.includes('NEW'),
  },
  oversized: {
    label: 'Oversized Fits',
    filterFn: (p) => p.fit_type === 'Oversized',
  },
  slim: {
    label: 'Slim Fit',
    filterFn: (p) => p.fit_type === 'Slim',
  },
  marvel: {
    label: 'Marvel Collection',
    filterFn: (p) => p.fandom_tag === 'Marvel',
  },
  anime: {
    label: 'Anime Collection',
    filterFn: (p) => p.fandom_tag === 'Anime',
  },
  dc: {
    label: 'DC Collection',
    filterFn: (p) => p.fandom_tag === 'DC',
  },
  sneakers: {
    label: 'Sneakers',
    filterFn: (p) => p.category === 'Sneakers',
  },
  hoodie: {
    label: 'Hoodies',
    filterFn: (p) => p.id.includes('hoodie'),
  },
};

export function getStyleRecommendations(keyword: string, products: Product[]): Product[] {
  const entry = STYLE_MAP[keyword.toLowerCase()];
  if (!entry) return [];
  return products.filter(entry.filterFn).slice(0, 4);
}

// ─── Intent Handlers ──────────────────────────────────────────────────────────

function handleGreeting(ctx: ChatContext): BotResponse {
  return {
    text: t(ctx.lang, 'greeting'),
    quickReplies: ['Best Sellers', 'New Arrivals', 'Style Quiz', 'Track Order', 'My Cart'],
  };
}

function handleHelp(ctx: ChatContext): BotResponse {
  const options = [
    'Best Sellers — Trending items',
    'New Arrivals — Latest collections',
    'Size Help — Find your correct fit',
    'Offers — Current promotions',
    'Track Order — Shipment status',
    'Style Quiz — Personalized recommendations',
    'Checkout — Place your order',
    'Returns — Exchange and refund policy',
  ];
  return {
    text: `${t(ctx.lang, 'help_menu')}\n\n${options.join('\n')}`,
    quickReplies: ['Best Sellers', 'Style Quiz', 'Track Order'],
  };
}

function handleBestsellers(products: Product[]): BotResponse {
  const best = products.filter(p => p.badges.includes('BESTSELLER')).slice(0, 4);
  return {
    text: 'Here are our top-selling items at the moment:',
    widget: 'ProductCards',
    widgetData: best,
    quickReplies: ['New Arrivals', 'Style Quiz', 'Track Order'],
  };
}

function handleNewArrivals(products: Product[]): BotResponse {
  const newItems = products.filter(p => p.badges.includes('NEW')).slice(0, 4);
  return {
    text: 'Our latest arrivals:',
    widget: 'ProductCards',
    widgetData: newItems,
    quickReplies: ['Best Sellers', 'Style Quiz', 'Checkout'],
  };
}

function handleFandomQuery(text: string, products: Product[]): BotResponse {
  const lower = text.toLowerCase();
  let fandom = '';
  let label = '';
  if (lower.includes('marvel') || lower.includes('avengers') || lower.includes('spider')) { fandom = 'Marvel'; label = 'Marvel'; }
  else if (lower.includes('dc') || lower.includes('batman') || lower.includes('superman') || lower.includes('joker')) { fandom = 'DC'; label = 'DC'; }
  else if (lower.includes('anime') || lower.includes('naruto') || lower.includes('dbz') || lower.includes('dragon') || lower.includes('one piece') || lower.includes('aot') || lower.includes('attack')) { fandom = 'Anime'; label = 'Anime'; }
  else if (lower.includes('rick') || lower.includes('morty')) { fandom = 'Rick & Morty'; label = 'Rick & Morty'; }

  if (!fandom) {
    return {
      text: 'Which collection are you interested in?',
      quickReplies: ['Marvel', 'Anime', 'DC', 'Rick & Morty'],
    };
  }
  const items = products.filter(p => p.fandom_tag === fandom).slice(0, 4);
  return {
    text: `The ${label} collection. Please view the items below:`,
    widget: 'ProductCards',
    widgetData: items,
    quickReplies: ['Checkout', 'Best Sellers', 'Style Quiz'],
  };
}

function handlePriceQuery(ctx: ChatContext, products: Product[]): BotResponse {
  if (ctx.lastProduct) {
    const p = products.find(prod => prod.id === ctx.lastProduct);
    if (p) {
      const discount = Math.round(((p.prices.base - p.prices.sale) / p.prices.base) * 100);
      return {
        text: `**${p.title}**\n• Sale Price: ₹${p.prices.sale}\n• MRP: ~~₹${p.prices.base}~~\n• Member Price: ₹${p.prices.member}\n• Discount: ${discount}% off`,
        quickReplies: ['Add to Cart', 'Size Help', 'Best Sellers'],
      };
    }
  }
  return {
    text: "Please provide the name of the product you are inquiring about, or browse our categories:",
    quickReplies: ['Best Sellers', 'New Arrivals', 'Fandom Collection'],
  };
}

function handleMaterialQuery(ctx: ChatContext, products: Product[]): BotResponse {
  if (ctx.lastProduct) {
    const p = products.find(prod => prod.id === ctx.lastProduct);
    if (p) {
      return {
        text: `**${p.title}** Specifications:\n• Material: ${p.details.material}\n• GSM: ${p.details.gsm}\n• Care Instructions: ${p.details.wash_care}`,
        quickReplies: ['Price', 'Size Guide', 'Checkout'],
      };
    }
  }
  return {
    text: "Our products are crafted using premium cotton (180–260 GSM). Which specific product's details would you like to review?",
    quickReplies: ['Best Sellers', 'New Arrivals'],
  };
}

function handleSizeHelp(): BotResponse {
  return {
    text: 'Please refer to our size guide below:',
    widget: 'SizeGuide',
    quickReplies: ["Men's Sizes", "Women's Sizes", 'Oversized Fit', 'Slim Fit'],
  };
}

function handleCartSummary(cart: CartItem[], products: Product[], ctx: ChatContext): BotResponse {
  if (!cart.length) {
    return {
      text: t(ctx.lang, 'empty_cart'),
      quickReplies: ['Best Sellers', 'New Arrivals', 'Style Quiz'],
    };
  }
  return {
    text: `You have ${cart.length} item(s) in your cart:`,
    widget: 'CartSummary',
    widgetData: { cart, products },
    quickReplies: ['Checkout', 'Clear Cart', 'Continue Shopping'],
  };
}

function handleOfferQuery(ctx: ChatContext): BotResponse {
  return {
    text: `Current Promotional Offers:\n• **WELCOME10** — 10% discount on your first order\n• **MEMBER** — Complimentary membership provides an additional ₹200 discount\n• **ANIME20** — 20% discount on the Anime collection\n• Complimentary shipping on orders exceeding ₹999`,
    quickReplies: ['Checkout', 'Best Sellers', 'Membership'],
  };
}

function handleReturnPolicy(ctx: ChatContext): BotResponse {
  return {
    text: `**Return and Exchange Policy:**\n• Returns are accepted within 7 days of delivery.\n• Size exchanges are provided at no additional cost.\n• Full refunds are issued for damaged or incorrect items.\n• Items purchased during a sale are non-returnable.\n\nTo initiate a return, please provide your Order ID.`,
    quickReplies: ['Track Order', 'Continue Shopping', 'Contact Support'],
  };
}

function handleMembership(ctx: ChatContext): BotResponse {
  return {
    text: `**ADIS Membership Program:**\n• Complimentary enrollment\n• Exclusive member pricing (₹200–₹500 discount)\n• Early access to new collections\n• Priority shipping\n• Special birthday promotions\n\nWould you like to enroll?`,
    quickReplies: ['Join Now', 'Best Sellers'],
  };
}

function handleContactSupport(ctx: ChatContext): BotResponse {
  return {
    text: t(ctx.lang, 'contact_support'),
    quickReplies: ['Best Sellers', 'Track Order'],
  };
}

function handleTrackOrder(ctx: ChatContext): BotResponse {
  return {
    text: 'Please provide your Order ID (e.g., AD-12345) or AWB tracking number to check the status:',
    quickReplies: ['Check Recent Order', 'Return Policy'],
  };
}

function handleFarewell(ctx: ChatContext): BotResponse {
  return {
    text: t(ctx.lang, 'farewell'),
    quickReplies: ['Continue Shopping', 'Style Quiz'],
  };
}

// ─── Flow Handlers ────────────────────────────────────────────────────────────

export function handleCheckoutFlow(
  step: FlowStep,
  input: string,
  ctx: ChatContext,
  cart: CartItem[],
): { response: BotResponse; newCtx: Partial<ChatContext> } {
  if (!cart.length) {
    return {
      response: { text: t(ctx.lang, 'empty_cart'), quickReplies: ['Best Sellers'] },
      newCtx: { currentFlow: null, flowStep: null },
    };
  }

  if (step === 'ASK_ADDRESS') {
    return {
      response: {
        text: t(ctx.lang, 'ask_payment'),
        quickReplies: ['Cash on Delivery', 'Pay Online (Razorpay)'],
      },
      newCtx: {
        flowStep: 'ASK_PAYMENT',
        orderData: { address: input },
      },
    };
  }

  if (step === 'ASK_PAYMENT') {
    const isCOD = input.toLowerCase().includes('cod') || input.toLowerCase().includes('cash');
    const orderId = `AD-${Math.floor(10000 + Math.random() * 90000)}`;
    const confirmText = t(ctx.lang, 'order_confirmed', { orderId });
    const orderSummary = {
      orderId,
      status: 'Confirmed',
      items: cart.length,
      payment: isCOD ? 'Cash on Delivery' : 'Razorpay (Online)',
      address: ctx.orderData.address ?? 'N/A',
    };
    return {
      response: {
        text: confirmText,
        widget: 'OrderCard',
        widgetData: orderSummary,
        quickReplies: ['Continue Shopping', 'Track Order'],
      },
      newCtx: { currentFlow: null, flowStep: null, orderData: {} },
    };
  }

  return {
    response: { text: t(ctx.lang, 'ask_address') },
    newCtx: { flowStep: 'ASK_ADDRESS' },
  };
}

export function handleStyleQuizFlow(
  step: FlowStep,
  input: string,
  ctx: ChatContext,
  products: Product[],
): { response: BotResponse; newCtx: Partial<ChatContext> } {
  const lower = input.toLowerCase();

  if (step === 'ASK_OCCASION') {
    return {
      response: {
        text: 'What type of fit do you prefer?',
        quickReplies: ['Slim Fit', 'Regular Fit', 'Oversized', 'No Preference'],
      },
      newCtx: { flowStep: 'ASK_FIT', quizAnswers: { ...ctx.quizAnswers, occasion: input } },
    };
  }

  if (step === 'ASK_FIT') {
    return {
      response: {
        text: 'Do you have a preferred collection or fandom?',
        quickReplies: ['Marvel', 'Anime', 'DC', 'Rick & Morty', 'No Preference'],
      },
      newCtx: { flowStep: 'ASK_FANDOM', quizAnswers: { ...ctx.quizAnswers, fit: input } },
    };
  }

  if (step === 'ASK_FANDOM') {
    return {
      response: {
        text: 'What is your preferred price range?',
        quickReplies: ['Under ₹999', '₹999–₹1999', '₹2000+'],
      },
      newCtx: { flowStep: 'ASK_BUDGET', quizAnswers: { ...ctx.quizAnswers, fandom: input } },
    };
  }

  if (step === 'ASK_BUDGET') {
    const answers = { ...ctx.quizAnswers, budget: input };

    // Filter based on quiz answers
    let filtered = [...products];

    // Fit filter
    if (answers.fit && !answers.fit.toLowerCase().includes('no preference')) {
      const fitMap: Record<string, string> = {
        'slim fit': 'Slim',
        'regular fit': 'Regular',
        'oversized': 'Oversized',
      };
      const fitVal = fitMap[answers.fit.toLowerCase()];
      if (fitVal) filtered = filtered.filter(p => p.fit_type === fitVal);
    }

    // Fandom filter
    if (answers.fandom && !answers.fandom.toLowerCase().includes('no preference')) {
      const fandomMatch = answers.fandom.toLowerCase();
      if (fandomMatch !== 'no preference') {
        const fandomMap: Record<string, string> = {
          'marvel': 'Marvel', 'anime': 'Anime', 'dc': 'DC', 'rick & morty': 'Rick & Morty',
        };
        const fandomVal = fandomMap[fandomMatch];
        if (fandomVal) filtered = filtered.filter(p => p.fandom_tag === fandomVal);
      }
    }

    // Budget filter
    if (answers.budget) {
      if (answers.budget.includes('999') && answers.budget.startsWith('Under')) {
        filtered = filtered.filter(p => p.prices.sale < 999);
      } else if (answers.budget.includes('₹999')) {
        filtered = filtered.filter(p => p.prices.sale >= 999 && p.prices.sale < 2000);
      } else if (answers.budget.includes('2000')) {
        filtered = filtered.filter(p => p.prices.sale >= 2000);
      }
    }

    const picks = filtered.slice(0, 4);

    return {
      response: {
        text: `Based on your preferences, here are our recommended items:`,
        widget: picks.length > 0 ? 'ProductCards' : undefined,
        widgetData: picks.length > 0 ? picks : undefined,
        quickReplies: picks.length === 0 ? ['View All Products', 'Retake Quiz'] : ['Checkout', 'Best Sellers', 'Retake Quiz'],
      },
      newCtx: { currentFlow: null, flowStep: null, quizAnswers: {} },
    };
  }

  // Start of quiz
  return {
    response: {
      text: 'Let us assist you in finding the right style. What is the occasion?',
      quickReplies: ['Casual', 'Gym/Workout', 'Office/Formal', 'Party', 'Gift'],
    },
    newCtx: { currentFlow: 'style_quiz', flowStep: 'ASK_OCCASION', quizAnswers: {} },
  };
}

export function handleLeadCaptureFlow(
  step: FlowStep,
  input: string,
  ctx: ChatContext,
  existingUser: boolean,
  resumeFlow: Flow,
): { response: BotResponse; newCtx: Partial<ChatContext> } {
  if (step === 'ASK_NAME') {
    return {
      response: { text: t(ctx.lang, 'ask_phone'), quickReplies: [] },
      newCtx: { flowStep: 'ASK_PHONE', pendingUser: { ...ctx.pendingUser, name: input, pendingFlow: resumeFlow } },
    };
  }

  if (step === 'ASK_PHONE') {
    const phone = input.replace(/[^0-9]/g, '');
    if (phone.length < 10) {
      return {
        response: { text: 'Please provide a valid 10-digit phone number:', quickReplies: [] },
        newCtx: {},
      };
    }
    if (existingUser) {
      return {
        response: { text: t(ctx.lang, 'ask_password_existing'), quickReplies: [] },
        newCtx: { flowStep: 'VERIFY_PASSWORD', pendingUser: { ...ctx.pendingUser, phone, pendingFlow: resumeFlow } },
      };
    } else {
      return {
        response: { text: t(ctx.lang, 'ask_password_new'), quickReplies: [] },
        newCtx: { flowStep: 'ASK_PASSWORD', pendingUser: { ...ctx.pendingUser, phone, pendingFlow: resumeFlow } },
      };
    }
  }

  if (step === 'ASK_PASSWORD' || step === 'VERIFY_PASSWORD') {
    const name = ctx.pendingUser.name ?? 'friend';
    const isNew = step === 'ASK_PASSWORD';
    const pendingFlow = ctx.pendingUser.pendingFlow ?? null;
    return {
      response: {
        text: isNew
          ? t(ctx.lang, 'registered', { name })
          : t(ctx.lang, 'welcome_back', { name }),
        quickReplies: pendingFlow === 'checkout' ? ['Continue Checkout', 'Best Sellers']
          : pendingFlow === 'style_quiz' ? ['Continue Style Quiz', 'Best Sellers']
          : ['Best Sellers', 'New Arrivals'],
      },
      newCtx: { currentFlow: null, flowStep: null, pendingUser: {} },
    };
  }

  // Default: start auth by asking name
  return {
    response: { text: t(ctx.lang, 'ask_name'), quickReplies: [] },
    newCtx: { currentFlow: 'lead_capture', flowStep: 'ASK_NAME', pendingUser: { pendingFlow: resumeFlow } },
  };
}

// ─── AWB / Pincode handlers ───────────────────────────────────────────────────

function handlePincode(pincode: string): BotResponse {
  // Mock data — replace with real Shiprocket API
  const mockData: Record<string, { available: boolean; courier: string; days: number; cod: boolean }> = {
    '400001': { available: true, courier: 'BlueDart', days: 1, cod: true },
    '110001': { available: true, courier: 'Delhivery', days: 2, cod: true },
    '560001': { available: true, courier: 'Ekart', days: 3, cod: true },
  };
  const info = mockData[pincode] ?? { available: true, courier: 'Xpressbees', days: 4, cod: true };

  if (!info.available) {
    return {
      text: `We apologize, but delivery to pincode **${pincode}** is currently unavailable.`,
      quickReplies: ['Check Another Pincode', 'Best Sellers'],
      widget: 'PincodeResult',
      widgetData: { pincode, available: false },
    };
  }

  return {
    text: `Delivery to pincode **${pincode}** is available. Details below:`,
    widget: 'PincodeResult',
    widgetData: {
      pincode,
      available: true,
      courier: info.courier,
      days: info.days,
      cod: info.cod,
    },
    quickReplies: ['Checkout', 'Continue Shopping'],
  };
}

function handleAWBTracking(awb: string): BotResponse {
  // Mock timeline — replace with Shiprocket API
  const mockTimeline = [
    { status: 'Order Placed', time: '10:00 AM', done: true },
    { status: 'Packed & Dispatched', time: '3:00 PM', done: true },
    { status: 'In Transit', time: 'Yesterday', done: true },
    { status: 'Out for Delivery', time: 'Today', done: false },
    { status: 'Delivered', time: 'Expected Today by 8PM', done: false },
  ];
  return {
    text: `Tracking information for AWB **${awb}**:`,
    widget: 'OrderCard',
    widgetData: {
      orderId: awb,
      status: 'Out for Delivery',
      timeline: mockTimeline,
      estimatedDelivery: 'Today by 8:00 PM',
    },
    quickReplies: ['Return Policy', 'Continue Shopping'],
  };
}

// ─── Main Message Processor ───────────────────────────────────────────────────

export function processMessage(
  text: string,
  ctx: ChatContext,
  products: Product[],
  cart: CartItem[],
  isLoggedIn: boolean,
  checkExistingUser: (phone: string) => Promise<boolean>, // async callback
): { response: BotResponse; newCtx: ChatContext } {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Detect language and update context
  const detectedLang = detectLanguage(trimmed);
  const lang: Lang = detectedLang !== 'en' ? detectedLang : ctx.lang;

  // Build new history
  const history = [...ctx.history, { role: 'user' as const, text: trimmed }].slice(-10);

  let response: BotResponse = { text: t(lang, 'unknown'), quickReplies: DEFAULT_QUICK_REPLIES };
  let ctxUpdate: Partial<ChatContext> = { lang, history };

  // ── Flow hijacking ──────────────────────────────────────────────────────────
  if (ctx.currentFlow === 'checkout' && ctx.flowStep) {
    const { response: r, newCtx } = handleCheckoutFlow(ctx.flowStep, trimmed, ctx, cart);
    response = r;
    ctxUpdate = { ...ctxUpdate, ...newCtx };
    return { response, newCtx: { ...ctx, ...ctxUpdate } };
  }

  if (ctx.currentFlow === 'style_quiz' && ctx.flowStep) {
    const { response: r, newCtx } = handleStyleQuizFlow(ctx.flowStep, trimmed, ctx, products);
    response = r;
    ctxUpdate = { ...ctxUpdate, ...newCtx };
    return { response, newCtx: { ...ctx, ...ctxUpdate } };
  }

  if (ctx.currentFlow === 'lead_capture' && ctx.flowStep) {
    // For sync version — we pass false for existing user; ChatWidget does async Firebase check
    const { response: r, newCtx } = handleLeadCaptureFlow(ctx.flowStep, trimmed, ctx, false, ctx.pendingUser.pendingFlow ?? null);
    response = r;
    ctxUpdate = { ...ctxUpdate, ...newCtx };
    return { response, newCtx: { ...ctx, ...ctxUpdate } };
  }

  // ── Regex: pincode ──────────────────────────────────────────────────────────
  if (/^\d{6}$/.test(trimmed)) {
    response = handlePincode(trimmed);
    return { response, newCtx: { ...ctx, ...ctxUpdate } };
  }

  // ── Regex: AWB tracking ─────────────────────────────────────────────────────
  if (/^[A-Z0-9]{8,}$/i.test(trimmed) && trimmed.length >= 8 && !/^\d+$/.test(trimmed)) {
    response = handleAWBTracking(trimmed.toUpperCase());
    return { response, newCtx: { ...ctx, ...ctxUpdate } };
  }

  // ── Intent classification ───────────────────────────────────────────────────
  const intent = classifyIntent(trimmed);

  switch (intent) {
    case 'GREETING':
      response = handleGreeting({ ...ctx, lang });
      break;
    case 'FAREWELL':
      response = handleFarewell({ ...ctx, lang });
      break;
    case 'HELP':
      response = handleHelp({ ...ctx, lang });
      break;
    case 'BESTSELLERS':
      response = handleBestsellers(products);
      break;
    case 'NEW_ARRIVALS':
      response = handleNewArrivals(products);
      break;
    case 'FANDOM_QUERY':
      response = handleFandomQuery(trimmed, products);
      break;
    case 'PRICE_QUERY':
      response = handlePriceQuery(ctx, products);
      break;
    case 'MATERIAL_QUERY':
      response = handleMaterialQuery(ctx, products);
      break;
    case 'SIZE_HELP':
      response = handleSizeHelp();
      break;
    case 'CART_SUMMARY':
      response = handleCartSummary(cart, products, { ...ctx, lang });
      break;
    case 'OFFER_QUERY':
      response = handleOfferQuery({ ...ctx, lang });
      break;
    case 'RETURN_POLICY':
      response = handleReturnPolicy({ ...ctx, lang });
      break;
    case 'MEMBERSHIP':
      response = handleMembership({ ...ctx, lang });
      break;
    case 'CONTACT_SUPPORT':
      response = handleContactSupport({ ...ctx, lang });
      break;
    case 'TRACK_ORDER':
      response = handleTrackOrder({ ...ctx, lang });
      break;
    case 'CHECKOUT': {
      if (!isLoggedIn) {
        const { response: r, newCtx } = handleLeadCaptureFlow(null, trimmed, { ...ctx, lang }, false, 'checkout');
        response = r;
        ctxUpdate = { ...ctxUpdate, ...newCtx };
        break;
      }
      if (!cart.length) {
        response = { text: t(lang, 'empty_cart'), quickReplies: ['Best Sellers', 'New Arrivals'] };
        break;
      }
      response = {
        text: t(lang, 'ask_address'),
        quickReplies: [],
      };
      ctxUpdate = { ...ctxUpdate, currentFlow: 'checkout', flowStep: 'ASK_ADDRESS' };
      break;
    }
    case 'STYLE_QUIZ': {
      const { response: r, newCtx } = handleStyleQuizFlow(null, trimmed, { ...ctx, lang }, products);
      response = r;
      ctxUpdate = { ...ctxUpdate, ...newCtx };
      break;
    }
    case 'UNKNOWN': {
      // Try product name fuzzy match
      const matched = products.find(p =>
        lower.includes(p.title.toLowerCase().split(' ')[0]) ||
        lower.includes(p.id.replace(/-/g, ' ')) ||
        p.fandom_tag?.toLowerCase().split(' ').some(w => lower.includes(w))
      );
      if (matched) {
        response = {
          text: `We found the following item matching your query: **${matched.title}**:`,
          widget: 'ProductCards',
          widgetData: [matched],
          quickReplies: ['Price', 'Material', 'Size Guide', 'Add to Cart'],
        };
        ctxUpdate = { ...ctxUpdate, lastProduct: matched.id, lastTopic: matched.title };
      } else {
        // Check STYLE_MAP keywords
        for (const keyword of Object.keys(STYLE_MAP)) {
          if (lower.includes(keyword)) {
            const recs = getStyleRecommendations(keyword, products);
            if (recs.length > 0) {
              response = {
                text: `Based on your search for "${keyword}", please see the following recommendations:`,
                widget: 'ProductCards',
                widgetData: recs,
                quickReplies: ['Checkout', 'Best Sellers'],
              };
              break;
            }
          }
        }
      }
      break;
    }
  }

  const newHistory = [...history, { role: 'assistant' as const, text: response.text ?? '' }].slice(-10);

  return {
    response,
    newCtx: { ...ctx, ...ctxUpdate, history: newHistory },
  };
}

const DEFAULT_QUICK_REPLIES = ['Best Sellers', 'New Arrivals', 'Style Quiz', 'Track Order'];
