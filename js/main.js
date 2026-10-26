// ============================================
// কাচাবাজার — main.js (v2.0)
// Homepage render + global UI
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateWishlistBadge();

  // Back to top
  const backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('show', window.scrollY > 400);
    });
    backTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // হোমপেজ রেন্ডার (শুধু index.html-এ কাজ করবে)
  renderHeroBanner();
  renderCategories();
  renderDistricts();
  renderFeatured();       // async
  renderFarmers();
  renderTestimonials();
  startCountdown();
});

// ============================================
// HERO BANNER (Admin controlled)
// ============================================
function renderHeroBanner() {
  const heroImg = document.querySelector('.hero img');
  if (!heroImg) return;

  try {
    const banners = JSON.parse(localStorage.getItem('kc_admin_banners') || '[]');
    const activeBanner = banners.find(b => b.active);

    if (activeBanner) {
      heroImg.src = activeBanner.img;
      if (activeBanner.link) {
        heroImg.style.cursor = 'pointer';
        heroImg.onclick = () => location.href = activeBanner.link;
      }
    }
  } catch (e) {
    console.error('Banner load error:', e);
  }
}

// ============================================
// CATEGORIES
// ============================================
function renderCategories() {
  const el = document.getElementById('catGrid');
  if (!el || typeof CATEGORIES === 'undefined') return;
  el.innerHTML = CATEGORIES.map(c => `
    <a href="shop.html?cat=${c.id}" class="cat-card">
      <div class="emoji">${c.emoji}</div>
      <p>${c.name}</p>
    </a>
  `).join('');
}

// ============================================
// DISTRICTS
// ============================================
function renderDistricts() {
  const el = document.getElementById('districtsGrid');
  if (!el || typeof DISTRICTS === 'undefined') return;
  el.innerHTML = DISTRICTS.map(d => {
    return `
      <a href="shop.html?district=${d.id}" class="district-card">
        <img src="${d.img}" alt="${d.name}" loading="lazy">
        <div class="district-card-content">
          <div class="emoji">${d.emoji}</div>
          <h3>${d.name}</h3>
          <p>${d.tagline}</p>
        </div>
      </a>
    `;
  }).join('');
}

// ============================================
// FEATURED PRODUCTS (API → fallback)
// ============================================
async function renderFeatured() {
  const el = document.getElementById('featuredGrid');
  if (!el) return;

  try {
    const products = await loadProducts();
    if (!products || !products.length) {
      el.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--gray-500);padding:20px">
        এখনো কোনো পণ্য যোগ করা হয়নি।
      </p>`;
      return;
    }
    el.innerHTML = products.slice(0, 8).map(productCard).join('');
  } catch (err) {
    console.error('Featured load failed:', err);
    el.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--red-500);padding:20px">
      পণ্য লোড করা যায়নি: ${err.message}
    </p>`;
  }
}

// ============================================
// FARMERS
// ============================================
function renderFarmers() {
  const el = document.getElementById('farmersGrid');
  if (!el) return;
  if (typeof FARMERS === 'undefined') return;

  el.innerHTML = FARMERS.slice(0, 6).map(f => {
    const d = getDistrict(f.district);
    return `
      <div class="farmer-card">
        <div class="farmer-avatar">${f.name[0]}</div>
        <div class="farmer-info">
          <h4>${f.name}</h4>
          <p>${f.village}, ${d?.name || ''} · ${f.years} বছর</p>
          <p class="tagline">${f.crop}</p>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// TESTIMONIALS
// ============================================
function renderTestimonials() {
  const el = document.getElementById('testiGrid');
  if (!el) return;
  if (typeof TESTIMONIALS === 'undefined') return;

  el.innerHTML = TESTIMONIALS.map(t => `
    <div class="testi-card">
      <div class="stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <p>"${t.text}"</p>
      <div class="testi-user">
        <div class="avatar">${t.name[0]}</div>
        <div>
          <strong>${t.name}</strong>
          <small>${t.city}</small>
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================
// COUNTDOWN
// ============================================
function startCountdown() {
  const box = document.getElementById('countdown');
  if (!box) return;
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  function tick() {
    const diff = end - new Date();
    if (diff <= 0) {
      box.innerHTML = '<div><strong>০০</strong><span>শেষ</span></div>';
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');
    box.innerHTML = `
      <div><strong>${pad(h)}</strong><span>ঘণ্টা</span></div>
      <div><strong>${pad(m)}</strong><span>মিনিট</span></div>
      <div><strong>${pad(s)}</strong><span>সেকেন্ড</span></div>
    `;
  }
  tick();
  setInterval(tick, 1000);
}