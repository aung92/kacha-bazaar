// ============================================
// কাচাবাজার — utils.js (v2.0)
// Cart, Wishlist, Toast, Format, Product Card
// ============================================

// ============================================
// TOAST
// ============================================
function showToast(msg, type = '') {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ============================================
// CART (localStorage)
// ============================================
const Cart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('kc_cart') || '[]');
    } catch { return []; }
  },
  save(items) {
    localStorage.setItem('kc_cart', JSON.stringify(items));
    updateCartBadge();
  },
  add(id, qty = 1) {
    const items = this.get();
    const found = items.find(i => i.id === Number(id));
    if (found) {
      found.qty += Number(qty);
    } else {
      items.push({ id: Number(id), qty: Number(qty) });
    }
    this.save(items);
  },
  remove(id) {
    const items = this.get().filter(i => i.id !== Number(id));
    this.save(items);
  },
  setQty(id, qty) {
    const items = this.get();
    const found = items.find(i => i.id === Number(id));
    if (found) {
      found.qty = Number(qty);
      if (found.qty <= 0) {
        this.remove(id);
      } else {
        this.save(items);
      }
    }
  },
  count() {
    return this.get().reduce((s, i) => s + i.qty, 0);
  },
  clear() {
    localStorage.removeItem('kc_cart');
    updateCartBadge();
  }
};

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = Cart.count();
  const mobBadge = document.getElementById('mobileCartBadge');
  if (mobBadge) mobBadge.textContent = Cart.count();
}

// ============================================
// WISHLIST
// ============================================
const Wishlist = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('kc_wishlist') || '[]');
    } catch { return []; }
  },
  toggle(id) {
    let list = this.get();
    id = Number(id);
    if (list.includes(id)) list = list.filter(i => i !== id);
    else list.push(id);
    localStorage.setItem('kc_wishlist', JSON.stringify(list));
    updateWishlistBadge();
    return list.includes(id);
  },
  has(id) {
    return this.get().includes(Number(id));
  },
  clear() {
    localStorage.removeItem('kc_wishlist');
    updateWishlistBadge();
  }
};

function updateWishlistBadge() {
  const badge = document.getElementById('wishBadge');
  if (badge) badge.textContent = Wishlist.get().length;
}

// ============================================
// FORMAT
// ============================================
function formatTk(n) {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  const num = Number(n) || 0;
  return '৳' + num.toLocaleString('en-US').replace(/\d/g, d => bn[+d]);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  const toBn = (n) => String(n).padStart(2, '0').replace(/\d/g, x => bn[+x]);
  return `${toBn(d.getDate())}/${toBn(d.getMonth() + 1)}/${toBn(d.getFullYear())}`;
}

// ============================================
// PRODUCT CARD
// ============================================
function productCard(p) {
  const wished = Wishlist.has(p.id);
  const dist = typeof getDistrict === 'function' ? getDistrict(p.district) : null;
  const outOfStock = Number(p.stock) === 0;
  const oldPrice = p.oldPrice || p.old_price;

  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img">
        <a href="product.html?id=${p.id}">
          <img src="${p.img}" alt="${p.name}" loading="lazy">
        </a>
      </div>
      ${p.discount ? `<span class="discount-tag">-${p.discount}%</span>` : ''}
      <button class="wishlist-btn ${wished ? 'active' : ''}" onclick="handleWishlist(${p.id}, this)">
        <i class="fa-${wished ? 'solid' : 'regular'} fa-heart"></i>
      </button>
      <div class="product-info">
        ${dist ? `<span class="district-tag" style="background:${dist.color}20;color:${dist.color}">
          ${dist.emoji} ${dist.name}
        </span>` : ''}
        <a href="product.html?id=${p.id}"><h3>${p.name}</h3></a>
        <p class="product-unit">প্রতি ${p.unit}</p>
        <div class="rating">
          <i class="fa-solid fa-star"></i> ${p.rating}
        </div>
        <div class="price-row">
          <div>
            <span class="price">${formatTk(p.price)}</span>
            ${oldPrice ? `<span class="old-price">${formatTk(oldPrice)}</span>` : ''}
          </div>
          ${outOfStock
            ? `<button class="add-cart" disabled style="background:var(--gray-300);cursor:not-allowed" title="স্টক নেই">
                 <i class="fa-solid fa-ban"></i>
               </button>`
            : `<button class="add-cart" onclick="handleAddCart(${p.id})" title="কার্টে যোগ করুন">
                 <i class="fa-solid fa-plus"></i>
               </button>`}
        </div>
      </div>
    </div>`;
}

function handleAddCart(id) {
  Cart.add(id);
  showToast('কার্টে যোগ হয়েছে ✅', 'success');
}

function handleWishlist(id, btn) {
  const active = Wishlist.toggle(id);
  btn.classList.toggle('active', active);
  btn.innerHTML = `<i class="fa-${active ? 'solid' : 'regular'} fa-heart"></i>`;
  showToast(
    active ? 'উইশলিস্টে যোগ হয়েছে ❤️' : 'উইশলিস্ট থেকে সরানো হয়েছে',
    active ? 'success' : 'error'
  );
}