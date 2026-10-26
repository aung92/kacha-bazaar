// ============================================
// কাচাবাজার PWA — Initialization
// Version 1.0
// ============================================

(function() {
  'use strict';

  // ============================================
  // ১. Service Worker Register
  // ============================================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('sw.js', { scope: './' })
        .then((reg) => {
          console.log('✅ SW registered:', reg.scope);

          // আপডেট চেক
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
        .catch((err) => console.warn('SW register failed:', err));
    });

    // Controller change → reload
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  // ============================================
  // ২. Manifest যোগ (যদি না থাকে)
  // ============================================
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'manifest.json';
    document.head.appendChild(link);
  }

  // ============================================
  // ৩. Theme color
  // ============================================
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#16a34a';
    document.head.appendChild(meta);
  }

  // ============================================
  // ৪. Apple Touch Icon
  // ============================================
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = 'icons/icon-192.png';
    document.head.appendChild(link);
  }

  // ============================================
  // ৫. iOS PWA meta
  // ============================================
  const iosMetas = [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'কাচাবাজার' },
    { name: 'mobile-web-app-capable', content: 'yes' }
  ];
  iosMetas.forEach(({ name, content }) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const m = document.createElement('meta');
      m.name = name;
      m.content = content;
      document.head.appendChild(m);
    }
  });

  // ============================================
  // ৬. Install Prompt (A2HS)
  // ============================================
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.__pwaInstallPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    // ৭ দিনে একবার দেখাবে
    const lastShown = localStorage.getItem('kc_pwa_banner_shown');
    if (lastShown) {
      const days = (Date.now() - +lastShown) / (1000 * 60 * 60 * 24);
      if (days < 7) return;
    }

    // আগেই ইনস্টল করা থাকলে
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // ব্যানার তৈরি
    setTimeout(() => {
      const banner = document.createElement('div');
      banner.id = 'pwaInstallBanner';
      banner.innerHTML = `
        <div style="
          position: fixed;
          bottom: 90px;
          left: 16px;
          right: 16px;
          background: linear-gradient(135deg, #16a34a, #0891b2);
          color: #fff;
          padding: 14px 16px;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Hind Siliguri', sans-serif;
          max-width: 500px;
          margin: 0 auto;
          animation: slideUp 0.4s ease;
        ">
          <div style="
            width: 44px;
            height: 44px;
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            flex-shrink: 0;
          ">📱</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 14px; line-height: 1.3;">কাচাবাজার অ্যাপ ইনস্টল</div>
            <div style="font-size: 12px; opacity: 0.9;">হোম স্ক্রিনে যোগ করে দ্রুত ব্যবহার করুন</div>
          </div>
          <button id="pwaInstallBtn" style="
            background: #fff;
            color: #16a34a;
            border: none;
            padding: 8px 14px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            font-family: inherit;
            white-space: nowrap;
          ">ইনস্টল</button>
          <button id="pwaCloseBtn" style="
            background: transparent;
            border: none;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            padding: 0 4px;
            opacity: 0.8;
          ">×</button>
        </div>
        <style>
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @media (max-width: 768px) {
            #pwaInstallBanner > div { bottom: 80px !important; }
          }
        </style>
      `;
      document.body.appendChild(banner);

      document.getElementById('pwaInstallBtn').onclick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        console.log('Install choice:', choice.outcome);
        deferredPrompt = null;
        banner.remove();
        localStorage.setItem('kc_pwa_banner_shown', Date.now());
      };

      document.getElementById('pwaCloseBtn').onclick = () => {
        banner.remove();
        localStorage.setItem('kc_pwa_banner_shown', Date.now());
      };
    }, 3000);
  }

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed');
    localStorage.setItem('kc_pwa_banner_shown', Date.now());
  });

  // ============================================
  // ৭. Update Toast
  // ============================================
  function showUpdateToast() {
    if (document.getElementById('pwaUpdateToast')) return;
    const toast = document.createElement('div');
    toast.id = 'pwaUpdateToast';
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 16px;
        right: 16px;
        background: #111827;
        color: #fff;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Hind Siliguri', sans-serif;
        max-width: 460px;
        margin: 0 auto;
      ">
        <i class="fa-solid fa-rotate" style="font-size: 20px; color: #4ade80;"></i>
        <div style="flex: 1; font-size: 13px;">নতুন আপডেট পাওয়া গেছে</div>
        <button onclick="window.__reloadForUpdate()" style="
          background: #16a34a;
          color: #fff;
          border: none;
          padding: 7px 14px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
        ">আপডেট</button>
      </div>
    `;
    document.body.appendChild(toast);

    window.__reloadForUpdate = () => {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        else location.reload();
      });
    };
  }

  // ============================================
  // ৮. Online/Offline indicator
  // ============================================
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      if (!document.getElementById('pwaOfflineBar')) {
        const bar = document.createElement('div');
        bar.id = 'pwaOfflineBar';
        bar.innerHTML = `
          <div style="
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ef4444;
            color: #fff;
            padding: 8px;
            text-align: center;
            font-size: 13px;
            font-family: 'Hind Siliguri', sans-serif;
            font-weight: 600;
            z-index: 9999;
          ">
            <i class="fa-solid fa-wifi" style="margin-right:6px;"></i>
            আপনি অফলাইনে আছেন
          </div>
        `;
        document.body.appendChild(bar);
        document.body.style.paddingBottom = '40px';
      }
    } else {
      const bar = document.getElementById('pwaOfflineBar');
      if (bar) {
        bar.remove();
        document.body.style.paddingBottom = '';
      }
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  if (document.readyState === 'complete') updateOnlineStatus();

  console.log('✅ PWA initialized');
})();