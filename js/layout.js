// ============================================
// LAYOUT — Common Header + Nav + Footer + Mobile Bottom Nav
// ============================================

(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  const params = new URLSearchParams(location.search);
  const activeCat = params.get('cat');

  const navItems = [
    { href: 'index.html', label: 'হোম', match: 'index.html' },
    { href: 'shop.html', label: 'সব পণ্য', match: 'shop.html' },
    { href: 'districts.html', label: '৩ পার্বত্য জেলা', match: 'districts.html' },
    { href: 'shop.html?cat=veg', label: 'সবজি', cat: 'veg' },
    { href: 'shop.html?cat=fruit', label: 'ফলমূল', cat: 'fruit' },
    { href: 'shop.html?cat=fish', label: 'মাছ', cat: 'fish' },
    { href: 'shop.html?cat=meat', label: 'মাংস', cat: 'meat' },
    { href: 'shop.html?cat=spice', label: 'মসলা', cat: 'spice' },
    { href: 'shop.html?cat=honey', label: 'মধু', cat: 'honey' },
    { href: 'shop.html?cat=organic', label: 'অর্গানিক', cat: 'organic' },
    { href: 'about.html', label: 'আমাদের সম্পর্কে', match: 'about.html' },
    { href: 'contact.html', label: 'যোগাযোগ', match: 'contact.html' }
  ];

  function navLink(item) {
    const isActive = item.cat
      ? (path === 'shop.html' && activeCat === item.cat)
      : (path === item.match && !activeCat);
    return `<li><a href="${item.href}" class="${isActive ? 'active' : ''}">${item.label}</a></li>`;
  }

  const headerHTML = `
    <div class="top-bar">
      🌄 রাঙ্গামাটি · খাগড়াছড়ি · বান্দরবান — ৩ পার্বত্য জেলা থেকে সরাসরি | 🚚 ঢাকায় ফ্রি ডেলিভারি ৫০০৳+
    </div>
    <header class="header">
      <div class="container header-inner">
        <button class="menu-toggle" aria-label="Menu">
          <i class="fa-solid fa-bars"></i>
        </button>

        <a href="index.html" class="logo">কাচা<span>বাজার</span></a>

        <form class="search-bar" onsubmit="event.preventDefault(); location.href='shop.html?q='+encodeURIComponent(this.q.value)">
          <input name="q" type="text" placeholder="সবজি, ফল, মধু, মসলা খুঁজুন...">
          <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
        </form>

        <div class="header-actions">
          <a href="wishlist.html" class="icon-btn" title="Wishlist">
            <i class="fa-regular fa-heart"></i>
            <span class="badge" id="wishBadge" style="background:var(--red-500)">0</span>
          </a>
          <a href="cart.html" class="icon-btn" title="Cart">
            <i class="fa-solid fa-cart-shopping"></i>
            <span class="badge" id="cartBadge">0</span>
          </a>
          <!-- ✅ ডিফল্টভাবে লগইন বাটন, জাভাস্ক্রিপ্ট দিয়ে চেঞ্জ হবে -->
          <a href="login.html" class="login-btn desktop-only" id="loginBtn">লগইন</a>
        </div>
      </div>

      <div class="mobile-search-bar">
        <form onsubmit="event.preventDefault(); location.href='shop.html?q='+encodeURIComponent(this.q.value)">
          <input name="q" type="text" placeholder="সবজি, ফল, মধু, মসলা খুঁজুন...">
          <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
        </form>
      </div>

      <nav class="nav">
        <div class="container">
          <ul class="nav-list">${navItems.map(navLink).join('')}</ul>
        </div>
      </nav>
    </header>
  `;

  const footerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="logo" style="color:#fff">কাচা<span>বাজার</span></div>
            <p style="margin-top:12px">রাঙ্গামাটি, খাগড়াছড়ি ও বান্দরবানের কৃষকদের কাছ থেকে সরাসরি তাজা পণ্য — আপনার দরজায়।</p>
            <div class="socials">
              <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
              <a href="#"><i class="fa-brands fa-youtube"></i></a>
              <a href="#"><i class="fa-brands fa-instagram"></i></a>
              <a href="#"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
          </div>
          <div>
            <h4>দ্রুত লিংক</h4>
            <ul>
              <li><a href="shop.html">সব পণ্য</a></li>
              <li><a href="shop.html?cat=spice">মসলা</a></li>
              <li><a href="shop.html?cat=honey">মধু</a></li>
              <li><a href="wishlist.html">উইশলিস্ট</a></li>
              <li><a href="districts.html">৩ পার্বত্য জেলা</a></li>
              <li><a href="about.html">আমাদের সম্পর্কে</a></li>
              <li><a href="contact.html">যোগাযোগ</a></li>
            </ul>
          </div>
          <div>
            <h4>ক্যাটাগরি</h4>
            <ul>
              <li><a href="shop.html?cat=veg">সবজি</a></li>
              <li><a href="shop.html?cat=fruit">ফলমূল</a></li>
              <li><a href="shop.html?cat=fish">মাছ</a></li>
              <li><a href="shop.html?cat=spice">মসলা</a></li>
              <li><a href="shop.html?cat=honey">মধু</a></li>
              <li><a href="shop.html?cat=organic">অর্গানিক</a></li>
            </ul>
          </div>
          <div>
            <h4>যোগাযোগ</h4>
            <p>📍 ঢাকা, বাংলাদেশ</p>
            <p>☎️ ০১৭০০-০০০০০০</p>
            <p>✉️ info@kachabazar.com</p>
            <p style="margin-top:10px;font-size:13px">🕐 সকাল ৮টা – রাত ৯টা</p>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="fb-left">
            <p>© 2025 কাচাবাজার। সর্বস্বত্ব সংরক্ষিত।</p>
            <p class="credit">
              Developed by
              <a href="https://wa.me/8801918481232" target="_blank" rel="noopener">
                Aung Ching
              </a>
            </p>
          </div>
          <div class="payment-icons">
            <span>bKash</span><span>Nagad</span><span>Rocket</span><span>VISA</span>
          </div>
        </div>
      </div>
    </footer>
    <button class="back-top" id="backTopBtn"><i class="fa-solid fa-arrow-up"></i></button>
  `;

  const bottomNavHTML = `
    <div class="mobile-bottom-nav">
      <a href="index.html" class="${path === 'index.html' ? 'active' : ''}">
        <i class="fa-solid fa-house"></i>
        <span>হোম</span>
      </a>
      <a href="shop.html" class="${path === 'shop.html' ? 'active' : ''}">
        <i class="fa-solid fa-store"></i>
        <span>শপ</span>
      </a>
      <a href="cart.html" class="${path === 'cart.html' ? 'active' : ''}">
        <i class="fa-solid fa-cart-shopping"></i>
        <span>কার্ট</span>
        <span class="badge" id="mobileCartBadge" style="position:absolute; top:8px; right:14px; font-size:9px; padding:2px 5px;">0</span>
      </a>
      <a href="account.html" class="${path === 'account.html' ? 'active' : ''}">
        <i class="fa-regular fa-user"></i>
        <span>অ্যাকাউন্ট</span>
      </a>
    </div>
  `;

  function inject() {
    const headerSlot = document.getElementById('site-header');
    if (headerSlot) headerSlot.innerHTML = headerHTML;

    const footerSlot = document.getElementById('site-footer');
    if (footerSlot) footerSlot.innerHTML = footerHTML;

    document.body.insertAdjacentHTML('beforeend', bottomNavHTML);

    // ✅ মোবাইল মেনু টগল
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.toggle('open');
      });
    }

    // ✅ কার্ট এবং উইশলিস্ট ব্যাজ আপডেট
    if (typeof updateCartBadge === 'function') {
      updateCartBadge();
      const mobBadge = document.getElementById('mobileCartBadge');
      const cartBadge = document.getElementById('cartBadge');
      if (mobBadge && cartBadge) mobBadge.textContent = cartBadge.textContent;
    }
    const wishBadge = document.getElementById('wishBadge');
    if (wishBadge && typeof Wishlist !== 'undefined') {
      wishBadge.textContent = Wishlist.get().length;
    }

    // ✅ Back to top
    const backTop = document.getElementById('backTopBtn');
    if (backTop) {
      window.addEventListener('scroll', () => {
        backTop.classList.toggle('show', window.scrollY > 400);
      });
      backTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================
    // ✅ ১০০% ফিক্সড: Supabase লগইন চেক
    // ============================================
    // আপনার supabase-client.js থেকে supabaseClient গ্লোবালি পাওয়া যাচ্ছে কিনা তা চেক করা হচ্ছে
    if (window.supabaseClient || typeof supabase !== 'undefined') {
      const client = window.supabaseClient || window.supabase.createClient('https://ddjtvleuntyjuasawoyj.supabase.co', 'sb_publishable_37VvUbK_5T79ddNbAgzykg_gDUVpKKV');
      
      client.auth.getSession().then(({ data: { session } }) => {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn && session) {
          // ইউজার লগইন আছে
          loginBtn.textContent = 'আমার অ্যাকাউন্ট';
          loginBtn.href = 'account.html';
          loginBtn.style.background = 'var(--green-700)';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();