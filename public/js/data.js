// ============================================
// DISTRICTS
// ============================================
const DISTRICTS = [
  {
    id: 'rangamati',
    name: 'রাঙ্গামাটি',
    emoji: '🏞️',
    tagline: 'হ্রদের তীরে উর্বর জমি',
    desc: 'কাপ্তাই লেকের তীরে উর্বর মাটিতে চাষ হওয়া তাজা সবজি ও ফল।',
    img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600',
    color: '#0891b2'
  },
  {
    id: 'khagrachari',
    name: 'খাগড়াছড়ি',
    emoji: '⛰️',
    tagline: 'পাহাড়ি টিলার অর্গানিক ফসল',
    desc: 'পাহাড়ি ঢালে জৈব পদ্ধতিতে চাষ করা মসলা, ফল ও সবজি।',
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
    color: '#16a34a'
  },
  {
    id: 'bandarban',
    name: 'বান্দরবান',
    emoji: '🌿',
    tagline: 'সবচেয়ে তাজা পাহাড়ি পণ্য',
    desc: 'পাহাড়ের উঁচু এলাকার সতেজ শাকসবজি, ফল ও দুর্লভ মসলা।',
    img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600',
    color: '#7c3aed'
  }
];

// ============================================
// CATEGORIES
// ============================================
const CATEGORIES = [
  { id: 'veg',     name: 'সবজি',        emoji: '🥬' },
  { id: 'fruit',   name: 'ফলমূল',       emoji: '🍎' },
  { id: 'fish',    name: 'মাছ',         emoji: '🐟' },
  { id: 'meat',    name: 'মাংস',        emoji: '🍖' },
  { id: 'dairy',   name: 'দুধ ও ডিম',   emoji: '🥚' },
  { id: 'spice',   name: 'মসলা',        emoji: '🌶️' },
  { id: 'honey',   name: 'মধু',         emoji: '🍯' },
  { id: 'rice',    name: 'চাল ও ডাল',   emoji: '🌾' },
  { id: 'organic', name: 'অর্গানিক',    emoji: '🌿' }
];

// ============================================
// FARMERS
// ============================================
const FARMERS = [
  { id: 'f1', name: 'করিম মিয়া',   district: 'rangamati',    village: 'কাপ্তাই',    years: 15, crop: 'সবজি ও ফল' },
  { id: 'f2', name: 'সুবল চাকমা',  district: 'rangamati',    village: 'নানিয়ারচর', years: 20, crop: 'মাছ ও সবজি' },
  { id: 'f3', name: 'রতন ত্রিপুরা', district: 'khagrachari',  village: 'দীঘিনালা',   years: 12, crop: 'মসলা' },
  { id: 'f4', name: 'মেমং মারমা',  district: 'bandarban',    village: 'রুমা',        years: 18, crop: 'পাহাড়ি ফল ও মধু' },
  { id: 'f5', name: 'অংসুই প্রু',  district: 'bandarban',    village: 'থানচি',       years: 10, crop: 'অর্গানিক শাক ও মধু' },
  { id: 'f6', name: 'জুম্মন মিয়া', district: 'khagrachari',  village: 'মাটিরাঙ্গা',  years: 22, crop: 'সবজি' }
];

// ============================================
// TESTIMONIALS
// ============================================
const TESTIMONIALS = [
  { name: 'রফিক আহমেদ', city: 'ঢাকা',       text: 'রাঙ্গামাটি থেকে আসা সবজি সত্যিই আলাদা! তাজা আর সুস্বাদু।', rating: 5 },
  { name: 'সাদিয়া ইসলাম', city: 'চট্টগ্রাম',  text: 'বান্দরবানের পাহাড়ি কমলা ও মধু — অসাধারণ কোয়ালিটি।', rating: 5 },
  { name: 'করিম শেখ', city: 'সিলেট',       text: 'খাগড়াছড়ির কৃষকের কাছ থেকে সরাসরি মসলা পাচ্ছি, দামও কম।', rating: 4 }
];

// ============================================
// DEMO PRODUCTS (API ব্যর্থ হলে fallback)
// ============================================
const PRODUCTS = [
  {
    id: 1, name: 'পাহাড়ি টমেটো', category: 'veg', district: 'rangamati', farmer: 'f1',
    price: 60, oldPrice: 80, old_price: 80, discount: 25,
    unit: 'কেজি', stock: 50, rating: 4.8,
    img: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500'
  },
  {
    id: 2, name: 'কাঁচা মরিচ', category: 'veg', district: 'khagrachari', farmer: 'f3',
    price: 40, oldPrice: 50, old_price: 50, discount: 20,
    unit: 'কেজি', stock: 30, rating: 4.6,
    img: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=500'
  },
  {
    id: 3, name: 'পাহাড়ি মধু', category: 'honey', district: 'bandarban', farmer: 'f4',
    price: 750, oldPrice: 900, old_price: 900, discount: 17,
    unit: '৫০০ গ্রাম', stock: 20, rating: 5.0,
    img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500'
  },
  {
    id: 4, name: 'বান্দরবান কমলা', category: 'fruit', district: 'bandarban', farmer: 'f4',
    price: 120, oldPrice: 150, old_price: 150, discount: 20,
    unit: 'কেজি', stock: 40, rating: 4.9,
    img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500'
  },
  {
    id: 5, name: 'পাহাড়ি লাউ', category: 'veg', district: 'rangamati', farmer: 'f2',
    price: 45, oldPrice: 55, old_price: 55, discount: 18,
    unit: 'পিস', stock: 25, rating: 4.5,
    img: 'https://images.unsplash.com/photo-1566842600175-97dca489844f?w=500'
  },
  {
    id: 6, name: 'খাগড়াছড়ি হলুদ', category: 'spice', district: 'khagrachari', farmer: 'f3',
    price: 180, oldPrice: 220, old_price: 220, discount: 18,
    unit: 'কেজি', stock: 35, rating: 4.7,
    img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500'
  },
  {
    id: 7, name: 'পাহাড়ি রসুন', category: 'spice', district: 'khagrachari', farmer: 'f6',
    price: 150, oldPrice: 180, old_price: 180, discount: 17,
    unit: 'কেজি', stock: 28, rating: 4.6,
    img: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500'
  },
  {
    id: 8, name: 'পাহাড়ি কলা', category: 'fruit', district: 'rangamati', farmer: 'f1',
    price: 70, oldPrice: 90, old_price: 90, discount: 22,
    unit: 'ডজন', stock: 45, rating: 4.8,
    img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500'
  },
  {
    id: 9, name: 'পাহাড়ি মাছ', category: 'fish', district: 'rangamati', farmer: 'f2',
    price: 350, oldPrice: 400, old_price: 400, discount: 12,
    unit: 'কেজি', stock: 15, rating: 4.7,
    img: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500'
  },
  {
    id: 10, name: 'পাহাড়ি আদা', category: 'spice', district: 'khagrachari', farmer: 'f3',
    price: 200, oldPrice: 240, old_price: 240, discount: 17,
    unit: 'কেজি', stock: 22, rating: 4.5,
    img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500'
  },
  {
    id: 11, name: 'পাহাড়ি বেগুন', category: 'veg', district: 'bandarban', farmer: 'f5',
    price: 55, oldPrice: 70, old_price: 70, discount: 21,
    unit: 'কেজি', stock: 32, rating: 4.6,
    img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500'
  },
  {
    id: 12, name: 'অর্গানিক শাক', category: 'organic', district: 'bandarban', farmer: 'f5',
    price: 40, oldPrice: 50, old_price: 50, discount: 20,
    unit: 'আঁটি', stock: 50, rating: 4.8,
    img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'
  }
];

// ============================================
// HELPERS
// ============================================
function getDistrict(id) {
  return DISTRICTS.find(d => d.id === id);
}

function getFarmer(id) {
  return FARMERS.find(f => f.id === id);
}

function getCategory(id) {
  return CATEGORIES.find(c => c.id === id);
}

// PRODUCTS API থেকে লোড করার helper (fallback সহ)
async function loadProducts() {
  try {
    if (typeof apiGet === 'function') {
      const data = await apiGet('/products');
      if (Array.isArray(data) && data.length) return data;
    }
  } catch (e) {
    console.warn('API failed, using demo products:', e.message);
  }
  return PRODUCTS;
}