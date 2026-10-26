// ============================================
// কাচাবাজার Admin — Data Store + Demo Data
// v3.0 — FIXED: Single AdminStore, deep merge, seed safety
// ============================================

// ============================================
// ADMIN STORE (localStorage wrapper) — ONLY ONE
// ============================================
const AdminStore = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem('kc_admin_' + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem('kc_admin_' + key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        if (typeof showToast === 'function') {
          showToast('স্টোরেজ পূর্ণ! কিছু ডেটা মুছে ফেলুন।', 'error');
        }
      }
      console.error('AdminStore.set error:', e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem('kc_admin_' + key);
  },

  // ✅ Deep merge helper — nested object এর জন্য
  merge(key, defaults) {
    const stored = this.get(key, {});
    if (Array.isArray(defaults)) {
      return Array.isArray(stored) && stored.length ? stored : defaults;
    }
    if (typeof defaults === 'object' && defaults !== null) {
      return { ...defaults, ...(typeof stored === 'object' ? stored : {}) };
    }
    return stored !== null && stored !== undefined ? stored : defaults;
  }
};

// ============================================
// DEMO DATA
// ============================================
const DEMO_PRODUCTS = [
  { id: 1, name: 'দেশি টমেটো', category: 'veg', district: 'rangamati', farmer: 'f1', price: 60, oldPrice: 80, unit: 'কেজি', stock: 50, rating: 4.5, img: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', active: true },
  { id: 2, name: 'পাহাড়ি আলু', category: 'veg', district: 'khagrachari', farmer: 'f6', price: 35, oldPrice: 45, unit: 'কেজি', stock: 100, rating: 4.3, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', active: true },
  { id: 4, name: 'পাহাড়ি কমলা', category: 'fruit', district: 'bandarban', farmer: 'f4', price: 180, oldPrice: 220, unit: 'কেজি', stock: 25, rating: 4.9, img: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400', active: true },
  { id: 6, name: 'কাপ্তাই রুই মাছ', category: 'fish', district: 'rangamati', farmer: 'f2', price: 320, oldPrice: 380, unit: 'কেজি', stock: 8, rating: 4.7, img: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', active: true },
  { id: 9, name: 'পাহাড়ি গোলমরিচ', category: 'spice', district: 'khagrachari', farmer: 'f3', price: 900, oldPrice: 0, unit: 'কেজি', stock: 10, rating: 4.8, img: 'https://images.unsplash.com/photo-1599909533730-2b0e5f9fef1c?w=400', active: true },
  { id: 14, name: 'পাহাড়ি মধু', category: 'honey', district: 'bandarban', farmer: 'f4', price: 850, oldPrice: 1000, unit: '৫০০ গ্রাম', stock: 12, rating: 5.0, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', active: true },
  { id: 21, name: 'পাহাড়ি জুম মধু', category: 'honey', district: 'bandarban', farmer: 'f4', price: 1200, oldPrice: 1400, unit: '৫০০ গ্রাম', stock: 5, rating: 5.0, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', active: true },
  { id: 25, name: 'পাহাড়ি চাকের মধু', category: 'honey', district: 'rangamati', farmer: 'f1', price: 1600, oldPrice: 0, unit: 'কেজি', stock: 3, rating: 5.0, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', active: true }
];

const DEMO_ORDERS = [
  {
    id: 'KC100001', customer: 'রফিক আহমেদ', phone: '01711111111',
    address: 'মিরপুর ১০, ঢাকা', area: 'মিরপুর', date: '2025-01-20',
    items: 2, subtotal: 970, delivery: 0, total: 970,
    status: 'pending', payment: 'cod', paid: false, slot: 'আজ বিকাল (৩-৬টা)',
    items_detail: [
      { name: 'পাহাড়ি মধু', price: 850, qty: 1, unit: '৫০০ গ্রাম' },
      { name: 'দেশি টমেটো', price: 60, qty: 2, unit: 'কেজি' }
    ],
    timeline: [{ status: 'pending', at: '2025-01-20T10:00:00', by: 'System' }]
  },
  {
    id: 'KC100002', customer: 'সাদিয়া ইসলাম', phone: '01722222222',
    address: 'উত্তরা সেক্টর ৭, ঢাকা', area: 'উত্তরা', date: '2025-01-20',
    items: 2, subtotal: 430, delivery: 40, total: 470,
    status: 'confirmed', payment: 'bkash', paid: true, slot: 'আজ সন্ধ্যা (৬-৯টা)',
    items_detail: [
      { name: 'পাহাড়ি কমলা', price: 180, qty: 2, unit: 'কেজি' },
      { name: 'পাহাড়ি আলু', price: 35, qty: 2, unit: 'কেজি' }
    ],
    timeline: [
      { status: 'pending', at: '2025-01-20T09:00:00', by: 'System' },
      { status: 'confirmed', at: '2025-01-20T09:30:00', by: 'Admin' }
    ]
  },
  {
    id: 'KC100003', customer: 'করিম শেখ', phone: '01733333333',
    address: 'ধানমন্ডি ২৭, ঢাকা', area: 'ধানমন্ডি', date: '2025-01-19',
    items: 4, subtotal: 1375, delivery: 0, total: 1375,
    status: 'delivered', payment: 'cod', paid: true, slot: 'কাল সকাল (৮-১১টা)',
    items_detail: [
      { name: 'পাহাড়ি গোলমরিচ', price: 900, qty: 1, unit: 'কেজি' },
      { name: 'কাপ্তাই রুই মাছ', price: 320, qty: 1, unit: 'কেজি' },
      { name: 'দেশি টমেটো', price: 60, qty: 2, unit: 'কেজি' },
      { name: 'পাহাড়ি আলু', price: 35, qty: 1, unit: 'কেজি' }
    ],
    timeline: [
      { status: 'pending', at: '2025-01-19T08:00:00', by: 'System' },
      { status: 'confirmed', at: '2025-01-19T08:30:00', by: 'Admin' },
      { status: 'packed', at: '2025-01-19T11:00:00', by: 'Admin' },
      { status: 'shipped', at: '2025-01-19T14:00:00', by: 'Admin' },
      { status: 'delivered', at: '2025-01-19T17:30:00', by: 'Admin' }
    ]
  },
  {
    id: 'KC100004', customer: 'নাসরিন আক্তার', phone: '01744444444',
    address: 'বনানী, ঢাকা', area: 'বনানী', date: '2025-01-19',
    items: 1, subtotal: 320, delivery: 40, total: 360,
    status: 'shipped', payment: 'nagad', paid: true, slot: 'আজ বিকাল (৩-৬টা)',
    items_detail: [
      { name: 'কাপ্তাই রুই মাছ', price: 320, qty: 1, unit: 'কেজি' }
    ],
    timeline: [
      { status: 'pending', at: '2025-01-19T14:00:00', by: 'System' },
      { status: 'confirmed', at: '2025-01-19T14:30:00', by: 'Admin' },
      { status: 'packed', at: '2025-01-19T16:00:00', by: 'Admin' },
      { status: 'shipped', at: '2025-01-20T08:00:00', by: 'Admin' }
    ]
  },
  {
    id: 'KC100005', customer: 'জাহিদ হাসান', phone: '01755555555',
    address: 'গুলশান ২, ঢাকা', area: 'গুলশান', date: '2025-01-18',
    items: 2, subtotal: 1030, delivery: 0, total: 1030,
    status: 'pending', payment: 'cod', paid: false, slot: 'কাল সকাল (৮-১১টা)',
    items_detail: [
      { name: 'পাহাড়ি মধু', price: 850, qty: 1, unit: '৫০০ গ্রাম' },
      { name: 'পাহাড়ি কমলা', price: 180, qty: 1, unit: 'কেজি' }
    ],
    timeline: [{ status: 'pending', at: '2025-01-18T20:00:00', by: 'System' }]
  }
];

const DEMO_CUSTOMERS = [
  { id: 1, name: 'রফিক আহমেদ', phone: '01711111111', email: 'rafiq@example.com', orders: 5, spent: 4200, joined: '2024-12-01' },
  { id: 2, name: 'সাদিয়া ইসলাম', phone: '01722222222', email: 'sadia@example.com', orders: 3, spent: 2100, joined: '2024-12-15' },
  { id: 3, name: 'করিম শেখ', phone: '01733333333', email: 'karim@example.com', orders: 8, spent: 7800, joined: '2024-11-20' }
];

const DEMO_CATEGORIES = [
  { id: 'veg', name: 'সবজি', emoji: '🥬' },
  { id: 'fruit', name: 'ফলমূল', emoji: '🍎' },
  { id: 'fish', name: 'মাছ', emoji: '🐟' },
  { id: 'meat', name: 'মাংস', emoji: '🍖' },
  { id: 'dairy', name: 'দুধ ও ডিম', emoji: '🥚' },
  { id: 'spice', name: 'মসলা', emoji: '🌶️' },
  { id: 'honey', name: 'মধু', emoji: '🍯' },
  { id: 'rice', name: 'চাল ও ডাল', emoji: '🌾' },
  { id: 'organic', name: 'অর্গানিক', emoji: '🌿' }
];

const DEMO_DISTRICTS = [
  { id: 'rangamati', name: 'রাঙ্গামাটি', emoji: '🏞️', img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300', desc: 'কাপ্তাই লেকের তীরে' },
  { id: 'khagrachari', name: 'খাগড়াছড়ি', emoji: '⛰️', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300', desc: 'পাহাড়ি টিলার অর্গানিক' },
  { id: 'bandarban', name: 'বান্দরবান', emoji: '🌿', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300', desc: 'সবচেয়ে তাজা পাহাড়ি' }
];

const DEMO_FARMERS = [
  { id: 'f1', name: 'করিম মিয়া', district: 'rangamati', village: 'কাপ্তাই', years: 15, crop: 'সবজি ও ফল' },
  { id: 'f2', name: 'সুবল চাকমা', district: 'rangamati', village: 'নানিয়ারচর', years: 20, crop: 'মাছ ও সবজি' },
  { id: 'f3', name: 'রতন ত্রিপুরা', district: 'khagrachari', village: 'দীঘিনালা', years: 12, crop: 'মসলা' },
  { id: 'f4', name: 'মেমং মারমা', district: 'bandarban', village: 'রুমা', years: 18, crop: 'পাহাড়ি ফল ও মধু' },
  { id: 'f5', name: 'অংসুই প্রু', district: 'bandarban', village: 'থানচি', years: 10, crop: 'অর্গানিক শাক' },
  { id: 'f6', name: 'জুম্মন মিয়া', district: 'khagrachari', village: 'মাটিরাঙ্গা', years: 22, crop: 'সবজি' }
];

const DEMO_DELIVERY_PARTNERS = [
  { id: 1, name: 'Pathao Courier', logo: '', phone: '09610101010', charge: 60, time: '১-২ দিন', website: 'https://pathao.com', desc: 'ঢাকায় সবচেয়ে দ্রুত ডেলিভারি', active: true, showInCheckout: true },
  { id: 2, name: 'RedX', logo: '', phone: '09610101011', charge: 50, time: '২-৩ দিন', website: 'https://redx.com.bd', desc: 'সারা দেশে সাশ্রয়ী ডেলিভারি', active: true, showInCheckout: true },
  { id: 3, name: 'Steadfast', logo: '', phone: '09610101012', charge: 55, time: '২-৪ দিন', website: 'https://steadfast.com.bd', desc: 'নির্ভরযোগ্য ডেলিভারি সার্ভিস', active: true, showInCheckout: true }
];

const DEMO_DELIVERY_MEN = [
  { id: 1, name: 'রহিম মিয়া', phone: '01711223344', area: 'মিরপুর, ঢাকা', deliveries: 45, active: true, showInCheckout: true, img: '' },
  { id: 2, name: 'করিম আলী', phone: '01811223344', area: 'উত্তরা, ঢাকা', deliveries: 30, active: true, showInCheckout: true, img: '' },
  { id: 3, name: 'সেলিম হোসেন', phone: '01911223344', area: 'ধানমন্ডি, ঢাকা', deliveries: 15, active: true, showInCheckout: false, img: '' }
];

const DEMO_DELIVERY_ZONES = [
  { id: 1, name: 'ঢাকা সিটি', areas: 'মিরপুর, উত্তরা, ধানমন্ডি, বনানী, গুলশান', charge: 60, free: 500, time: '১-২ দিন', order: 1, note: '', active: true },
  { id: 2, name: 'ঢাকা সাবার্ব', areas: 'সাভার, গাজীপুর, কেরানীগঞ্জ, নারায়ণগঞ্জ', charge: 80, free: 800, time: '২-৩ দিন', order: 2, note: '', active: true },
  { id: 3, name: 'চট্টগ্রাম', areas: 'আগ্রাবাদ, পাহাড়তলী, চকবাজার, হাটহাজারী', charge: 120, free: 1000, time: '৩-৪ দিন', order: 3, note: '', active: true }
];

const DEMO_COUPONS = [
  { id: 1, code: 'SAVE10', type: 'percent', amount: 10, minOrder: 500, maxDiscount: 200, start: '2025-01-01', end: '2025-12-31', used: 12, limit: 100, active: true },
  { id: 2, code: 'FLAT50', type: 'flat', amount: 50, minOrder: 300, maxDiscount: 0, start: '2025-01-15', end: '2025-02-28', used: 8, limit: 50, active: true }
];

const DEMO_SUPPORT_TICKETS = [
  { id: 'TK1001', name: 'রফিক আহমেদ', phone: '01711111111', email: 'rafiq@example.com', subject: 'মধুর বোতল ভাঙা এসেছে', message: 'আজ অর্ডার পেয়েছি কিন্তু মধুর বোতল ভাঙা ছিল। কী করব?', status: 'new', date: '2025-01-21', reply: '' },
  { id: 'TK1002', name: 'সাদিয়া ইসলাম', phone: '01722222222', email: '', subject: 'ডেলিভারি কখন আসবে?', message: 'আমার অর্ডার #KC100002 কখন ডেলিভারি হবে?', status: 'open', date: '2025-01-20', reply: 'আগামীকাল সকাল ১০টার মধ্যে পৌঁছে যাবে।' }
];

// ============================================
// SETTINGS DEFAULT (single source)
// ============================================
const DEFAULT_SETTINGS = {
  siteName: 'কাচাবাজার',
  siteTagline: '৩ পার্বত্য জেলা থেকে সরাসরি',
  siteLogo: '',
  sitePhone: '০১৭০০-০০০০০০',
  siteEmail: 'info@kachabazar.com',
  siteAddress: 'ঢাকা, বাংলাদেশ',
  socialFacebook: '',
  socialInstagram: '',
  socialWhatsapp: '',
  socialYoutube: '',
  freeDelivery: 500,
  deliveryCharge: 40,
  deliveryAreas: 'ঢাকা — মিরপুর\nঢাকা — উত্তরা\nঢাকা — ধানমন্ডি',
  deliverySlots: 'আজ বিকাল (৩-৬টা)\nআজ সন্ধ্যা (৬-৯টা)\nকাল সকাল (৮-১১টা)',
  showDeliverySlot: true,
  showDeliveryPartner: true,
  payCod: true,
  payBkash: true,
  payNagad: true,
  payCard: false,
  bkashNumber: '01700000000',
  nagadNumber: '01700000000',
  maintenanceMode: false,
  maintenanceMsg: 'সাইটে রক্ষণাবেক্ষণ চলছে। শীঘ্রই ফিরে আসছি।',
  // ✅ নতুন: tax settings এক জায়গায়
  taxEnabled: true,
  taxes: [
    { id: 1, name: 'VAT', rate: 15, type: 'percent', active: true },
    { id: 2, name: 'Delivery VAT', rate: 5, type: 'percent', active: false }
  ]
};

// ============================================
// SEED — শুধু একবার, missing key গুলোই seed হবে
// ============================================
(function seedAdminData() {
  const seeds = {
    products: DEMO_PRODUCTS,
    orders: DEMO_ORDERS,
    customers: DEMO_CUSTOMERS,
    categories: DEMO_CATEGORIES,
    districts: DEMO_DISTRICTS,
    farmers: DEMO_FARMERS,
    delivery_partners: DEMO_DELIVERY_PARTNERS,
    delivery_men: DEMO_DELIVERY_MEN,
    delivery_zones: DEMO_DELIVERY_ZONES,
    coupons: DEMO_COUPONS,
    support_tickets: DEMO_SUPPORT_TICKETS,
    settings: DEFAULT_SETTINGS
  };
  Object.entries(seeds).forEach(([key, val]) => {
    if (localStorage.getItem('kc_admin_' + key) === null) {
      localStorage.setItem('kc_admin_' + key, JSON.stringify(val));
    }
  });
})();

// ============================================
// GLOBAL HELPERS — সব পেজ ব্যবহার করতে পারে
// ============================================

// ✅ Settings merge — সবসময় DEFAULT_SETTINGS এর সাথে merge
function getAdminSettings() {
  const stored = AdminStore.get('settings', {});
  return { ...DEFAULT_SETTINGS, ...(stored || {}) };
}

function saveAdminSettings(patch) {
  const current = getAdminSettings();
  const merged = { ...current, ...patch };
  AdminStore.set('settings', merged);
  return merged;
}

// ✅ Tax calculation — সব জায়গায় ব্যবহার হবে
function calculateTax(subtotal, country = 'BD') {
  const s = getAdminSettings();
  if (!s.taxEnabled) return { total: 0, breakdown: [] };
  const breakdown = [];
  let total = 0;
  (s.taxes || []).filter(t => t.active).forEach(t => {
    const amt = t.type === 'percent' ? (subtotal * t.rate) / 100 : t.rate;
    breakdown.push({ name: t.name, rate: t.rate, type: t.type, amount: Math.round(amt) });
    total += amt;
  });
  return { total: Math.round(total), breakdown };
}

// ✅ Order total calculation — সব জায়গায়
function calculateOrderTotals(order) {
  const items = (order.items_detail || []).filter(i => i.qty > 0);
  const subtotal = order.subtotal !== undefined
    ? order.subtotal
    : items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = order.delivery !== undefined
    ? order.delivery
    : (subtotal >= getAdminSettings().freeDelivery ? 0 : getAdminSettings().deliveryCharge);
  const tax = calculateTax(subtotal);
  const discount = order.discount || 0;
  const total = order.total !== undefined
    ? order.total
    : subtotal + delivery + tax.total - discount;
  return { subtotal, delivery, tax, discount, total };
}