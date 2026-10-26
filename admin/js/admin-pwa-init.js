// ============================================
// Admin PWA — Initialization
// ============================================

(function() {
  'use strict';

  // ============================================
  // ১. Service Worker Register
  // ============================================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/admin/admin-sw.js', { scope: '/admin/' })
        .then((reg) => {
          console.log('✅ Admin SW registered:', reg.scope);

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateToast();
              }
            });
          });
        })
        .catch((err) => console.warn('Admin SW failed:', err));
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  // ============================================
  // ২. Manifest যোগ
  // ============================================
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/admin/admin-manifest.json';
    document.head.appendChild(link);
  }

  // ============================================
  // ৩. Theme meta
  // ============================================
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#16a34a';
    document.head.appendChild(meta);
  }

  // ============================================
  // ৪. Apple meta
  // ============================================
  const appleMetas = [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'কাচাবাজার Admin' }
  ];
  appleMetas.forEach(({ name, content }) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const m = document.createElement('meta');
      m.name = name;
      m.content = content;
      document.head.appendChild(m);
    }
  });

  // ============================================
  // ৫. Install Prompt
  // ============================================
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const lastShown = localStorage.getItem('kc_admin_pwa_shown');
    if (lastShown && (Date.now() - +lastShown) / (1000 * 60 * 60 * 24) < 7) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    setTimeout(() => {
      const banner = document.createElement('div');
      banner.id = 'adminPwaBanner';
      banner.innerHTML = `
        <div style="
          position: fixed;
          bottom: 90px;
          right: 16px;
          background: linear-gradient(135deg, #16a34a, #0891b2);
          color: #fff;
          padding: 12px 16px;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Hind Siliguri', sans-serif;
          max-width: 340px;
        ">
          <div style="font-size: 24px;">⚡</div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 13px;">অ্যাডমিন অ্যাপ ইনস্টল</div>
            <div style="font-size: 11px; opacity: 0.9;">দ্রুত অ্যাক্সেস</div>
          </div>
          <button id="adminPwaInstallBtn" style="
            background: #fff;
            color: #16a34a;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            font-family: inherit;
          ">ইনস্টল</button>
          <button id="adminPwaCloseBtn" style="
            background: transparent;
            border: none;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            padding: 0 2px;
          ">×</button>
        </div>
      `;
      document.body.appendChild(banner);

      document.getElementById('adminPwaInstallBtn').onclick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        banner.remove();
        localStorage.setItem('kc_admin_pwa_shown', Date.now());
      };

      document.getElementById('adminPwaCloseBtn').onclick = () => {
        banner.remove();
        localStorage.setItem('kc_admin_pwa_shown', Date.now());
      };
    }, 3000);
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ Admin PWA installed');
    localStorage.setItem('kc_admin_pwa_shown', Date.now());
  });

  // ============================================
  // ৬. Update Toast
  // ============================================
  function showUpdateToast() {
    if (document.getElementById('adminPwaToast')) return;
    const toast = document.createElement('div');
    toast.id = 'adminPwaToast';
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 70px;
        left: 16px;
        right: 16px;
        background: #111827;
        color: #fff;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Hind Siliguri', sans-serif;
        max-width: 460px;
        margin: 0 auto;
        border: 1px solid #374151;
      ">
        <i class="fa-solid fa-rotate" style="font-size: 18px; color: #4ade80;"></i>
        <div style="flex: 1; font-size: 13px;">নতুন আপডেট পাওয়া গেছে</div>
        <button onclick="window.__adminReloadUpdate()" style="
          background: #16a34a;
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
        ">আপডেট</button>
      </div>
    `;
    document.body.appendChild(toast);

    window.__adminReloadUpdate = () => {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        else location.reload();
      });
    };
  }

  // ============================================
  // ৭. Online/Offline indicator
  // ============================================
  function updateStatus() {
    if (!navigator.onLine) {
      if (!document.getElementById('adminOfflineBar')) {
        const bar = document.createElement('div');
        bar.id = 'adminOfflineBar';
        bar.innerHTML = `
          <div style="
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #dc2626;
            color: #fff;
            padding: 8px;
            text-align: center;
            font-size: 13px;
            font-family: 'Hind Siliguri', sans-serif;
            font-weight: 600;
            z-index: 9999;
          ">
            <i class="fa-solid fa-wifi" style="margin-right:6px;"></i>
            অফলাইন মোড — ক্যাশড ডেটা দেখানো হচ্ছে
          </div>
        `;
        document.body.appendChild(bar);
      }
    } else {
      const bar = document.getElementById('adminOfflineBar');
      if (bar) bar.remove();
    }
  }
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();

  console.log('✅ Admin PWA initialized');
})();