// ============================================
// ADMIN LAYOUT — v6.2 (FINAL)
// Sidebar (RBAC + roles.html sync) + Topbar + Bottom Nav
// ✅ Fix: duplicate PWA meta, safe DOM access, safe logout
// ============================================

(function () {
  'use strict';

  const path = location.pathname.split('/').pop() || 'dashboard.html';

  // ============================================
  // Admin session পড়া
  // ============================================
  let admin = { name: 'Admin', email: 'admin@kachabazar.com', role: 'admin' };
  try {
    const stored = localStorage.getItem('kc_admin_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.email) admin = parsed;
    }
  } catch (e) {
    console.warn('admin user parse failed:', e);
  }

  const userRole = (admin.role || 'admin').toLowerCase();

  // ============================================
  // Counts
  // ============================================
  function getPendingOrders() {
    try {
      const orders = JSON.parse(localStorage.getItem('kc_admin_orders') || '[]');
      return Array.isArray(orders) ? orders.filter(o => o.status === 'pending').length : 0;
    } catch { return 0; }
  }

  function getNewTickets() {
    try {
      const tickets = JSON.parse(localStorage.getItem('kc_admin_support_tickets') || '[]');
      return Array.isArray(tickets) ? tickets.filter(t => t.status === 'new').length : 0;
    } catch { return 0; }
  }

  // ============================================
  // Menu structure
  // ============================================
  const menu = [
    {
      id: 'main',
      icon: 'fa-house',
      label: 'মূল',
      roles: ['admin', 'manager', 'editor', 'staff'],
      items: [
        { href: 'dashboard.html', icon: 'fa-gauge-high', label: 'ড্যাশবোর্ড' }
      ]
    },
    {
      id: 'business',
      icon: 'fa-briefcase',
      label: 'ব্যবসা',
      roles: ['admin', 'manager', 'staff'],
      items: [
        { href: 'orders.html', icon: 'fa-cart-shopping', label: 'অর্ডার', count: getPendingOrders() },
        { href: 'returns.html', icon: 'fa-rotate-left', label: 'রিটার্ন / রিফান্ড' },
        { href: 'customers.html', icon: 'fa-users', label: 'কাস্টমার' },
        { href: 'customer-segments.html', icon: 'fa-user-group', label: 'সেগমেন্ট' },
        { href: 'delivery-partners.html', icon: 'fa-truck-fast', label: 'ডেলিভারি পার্টনার' },
        { href: 'delivery-zones.html', icon: 'fa-location-dot', label: 'ডেলিভারি জোন' },
        { href: 'cod-limits.html', icon: 'fa-money-check-dollar', label: 'COD সীমা' },
        { href: 'payouts.html', icon: 'fa-money-bill-transfer', label: 'কৃষক পেমেন্ট' },
        { href: 'coupons.html', icon: 'fa-ticket', label: 'কুপন' },
        { href: 'gift-vouchers.html', icon: 'fa-gift', label: 'গিফট ভাউচার' },
        { href: 'free-gifts.html', icon: 'fa-hand-holding-heart', label: 'ফ্রি গিফট' },
        { href: 'reviews.html', icon: 'fa-comment-dots', label: 'রিভিউ' },
        { href: 'support-tickets.html', icon: 'fa-headset', label: 'সাপোর্ট টিকেট', count: getNewTickets() },
        { href: 'callback-requests.html', icon: 'fa-phone-volume', label: 'কলব্যাক রিকোয়েস্ট' }
      ]
    },
    {
      id: 'products',
      icon: 'fa-box',
      label: 'পণ্য',
      roles: ['admin', 'manager', 'editor'],
      items: [
        { href: 'products.html', icon: 'fa-box', label: 'পণ্যসমূহ' },
        { href: 'categories.html', icon: 'fa-tags', label: 'ক্যাটাগরি' },
        { href: 'districts.html', icon: 'fa-mountain', label: 'জেলা' },
        { href: 'farmers.html', icon: 'fa-user-tie', label: 'কৃষক' },
        { href: 'farmer-profiles.html', icon: 'fa-user-astronaut', label: 'কৃষক প্রোফাইল' },
        { href: 'banners.html', icon: 'fa-images', label: 'ব্যানার' },
        { href: 'featured.html', icon: 'fa-star', label: 'ফিচার্ড পণ্য' },
        { href: 'product-tags.html', icon: 'fa-hashtag', label: 'পণ্য ট্যাগ' },
        { href: 'product-qa.html', icon: 'fa-circle-question', label: 'প্রোডাক্ট Q&A' }
      ]
    },
    {
      id: 'marketing',
      icon: 'fa-bullhorn',
      label: 'মার্কেটিং',
      roles: ['admin', 'manager'],
      items: [
        { href: 'offers.html', icon: 'fa-fire', label: 'অফার / ক্যাম্পেইন' },
        { href: 'notifications.html', icon: 'fa-bullhorn', label: 'নোটিফিকেশন' },
        { href: 'message-templates.html', icon: 'fa-message', label: 'মেসেজ টেম্পলেট' },
        { href: 'loyalty-points.html', icon: 'fa-star-half-stroke', label: 'লয়্যালটি পয়েন্ট' },
        { href: 'referrals.html', icon: 'fa-share-nodes', label: 'রেফারেল' },
        { href: 'subscriptions.html', icon: 'fa-arrows-rotate', label: 'সাবস্ক্রিপশন' },
        { href: 'stock-alerts.html', icon: 'fa-bell', label: 'স্টক অ্যালার্ট' },
        { href: 'abandoned-carts.html', icon: 'fa-cart-arrow-down', label: 'কার্ট অ্যাব্যান্ডন' }
      ]
    },
    {
      id: 'content',
      icon: 'fa-pen-to-square',
      label: 'কনটেন্ট',
      roles: ['admin', 'editor'],
      items: [
        { href: 'blog.html', icon: 'fa-newspaper', label: 'ব্লগ / পেজ' },
        { href: 'video-showcase.html', icon: 'fa-video', label: 'ভিডিও শোকেস' },
        { href: 'seo-settings.html', icon: 'fa-magnifying-glass-chart', label: 'SEO সেটিংস' },
        { href: 'languages.html', icon: 'fa-language', label: 'মাল্টি-ল্যাঙ্গুয়েজ' },
        { href: 'theme-settings.html', icon: 'fa-palette', label: 'থিম সেটিংস' }
      ]
    },
    {
      id: 'system',
      icon: 'fa-gear',
      label: 'সিস্টেম',
      roles: ['admin'],
      items: [
        { href: 'staff.html', icon: 'fa-users-gear', label: 'স্টাফ ম্যানেজমেন্ট' },
        { href: 'reports.html', icon: 'fa-chart-line', label: 'রিপোর্ট' },
        { href: 'advanced-reports.html', icon: 'fa-chart-pie', label: 'অ্যাডভান্সড রিপোর্ট' },
        { href: 'tax.html', icon: 'fa-percent', label: 'ট্যাক্স / VAT' },
        { href: 'roles.html', icon: 'fa-user-shield', label: 'রোল / পারমিশন' },
        { href: 'activity-log.html', icon: 'fa-clipboard-check', label: 'অ্যাক্টিভিটি লগ' },
        { href: 'settings.html', icon: 'fa-gear', label: 'সেটিংস' }
      ]
    }
  ];

  // ============================================
  // Helpers
  // ============================================
  function isActive(href) { return path === href; }
  function isGroupActive(group) { return group.items.some(i => isActive(i.href)); }

  function getOpenGroups() {
    try {
      const stored = localStorage.getItem('kc_admin_open_groups');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    const active = menu.find(g => isGroupActive(g));
    return active ? [active.id] : ['main'];
  }
  const openGroups = getOpenGroups();

  // ✅ Roles.html এর সাথে sync
  function roleHasAccess(groupRoles) {
    if (groupRoles.includes(userRole)) return true;

    // Custom roles.html থেকে চেক
    try {
      const customRoles = JSON.parse(localStorage.getItem('kc_admin_roles') || '[]');
      const custom = customRoles.find(r => (r.name || '').toLowerCase() === userRole);
      if (custom && Array.isArray(custom.perms)) {
        const permMap = {
          business: ['orders', 'customers'],
          products: ['products'],
          marketing: ['coupons', 'reports'],
          content: ['settings'],
          system: ['settings', 'reports']
        };
        const needed = permMap[groupRoles[0]] || [];
        return needed.some(p => custom.perms.includes(p));
      }
    } catch {}
    return false;
  }

  const allowedMenu = menu.filter(group => roleHasAccess(group.roles));

  // ============================================
  // Sidebar render
  // ============================================
  function renderMenuGroup(group) {
    const active = isGroupActive(group);
    const isOpen = openGroups.includes(group.id);
    const totalCount = group.items.reduce((s, i) => s + (i.count || 0), 0);

    return `
      <li class="nav-group ${isOpen ? 'open' : ''}">
        <button class="nav-group-toggle ${active ? 'active-parent' : ''}" onclick="toggleMenuGroup('${group.id}', event)">
          <i class="fa-solid ${group.icon}"></i>
          <span class="nav-group-label">${group.label}</span>
          ${totalCount > 0 ? `<span class="nav-group-count">${totalCount}</span>` : ''}
          <i class="fa-solid fa-chevron-down nav-group-arrow"></i>
        </button>
        <ul class="nav-group-items">
          ${group.items.map(item => `
            <li>
              <a href="${item.href}" class="${isActive(item.href) ? 'active' : ''}">
                <i class="fa-solid ${item.icon}"></i>
                <span>${item.label}</span>
                ${item.count ? `<span class="count">${item.count}</span>` : ''}
              </a>
            </li>
          `).join('')}
        </ul>
      </li>
    `;
  }

  const sidebarHTML = `
    <aside class="sidebar" id="adminSidebar">
      <div class="sidebar-brand">
        কাচা<span>বাজার</span>
        <small>${userRole.toUpperCase()} Panel v6.2</small>
      </div>
      <ul class="sidebar-nav">
        ${allowedMenu.map(g => renderMenuGroup(g)).join('')}
      </ul>
      <div class="sidebar-footer">
        © 2025 কাচাবাজার Admin
      </div>
    </aside>
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
  `;

  // ============================================
  // Topbar render
  // ============================================
  const initial = (admin.name || 'A')[0].toUpperCase();
  const pendingCount = getPendingOrders();
  const newTickets = getNewTickets();

  const topbarHTML = `
    <header class="topbar">
      <button class="topbar-toggle" onclick="toggleSidebar()">
        <i class="fa-solid fa-bars"></i>
      </button>
      <div class="topbar-title" id="topbarTitle">ড্যাশবোর্ড</div>
      <div class="topbar-actions">
        <a href="../index.html" target="_blank" class="icon-btn" title="সাইট দেখুন">
          <i class="fa-solid fa-external-link-alt"></i>
        </a>

        <div class="profile-dropdown">
          <div class="icon-btn" onclick="toggleNotifMenu(event)" title="নোটিফিকেশন">
            <i class="fa-solid fa-bell"></i>
            ${(pendingCount + newTickets) > 0 ? '<span class="dot"></span>' : ''}
          </div>
          <div class="profile-menu" id="notifMenu" style="min-width:280px;">
            <div class="profile-menu-head" style="display:flex;justify-content:space-between;align-items:center;">
              <strong>নোটিফিকেশন</strong>
              <span style="font-size:11px;color:var(--gray-500);">${pendingCount + newTickets}টি নতুন</span>
            </div>
            <ul class="profile-menu-list">
              ${pendingCount > 0 ? `
                <li>
                  <a href="orders.html?status=pending">
                    <i class="fa-solid fa-cart-shopping" style="color:var(--orange-500)"></i>
                    <div>
                      <strong>${pendingCount}টি নতুন অর্ডার</strong><br>
                      <small style="color:var(--gray-500);font-size:11px;">ক্লিক করে দেখুন</small>
                    </div>
                  </a>
                </li>` : ''}
              ${newTickets > 0 ? `
                <li>
                  <a href="support-tickets.html">
                    <i class="fa-solid fa-headset" style="color:var(--blue-500)"></i>
                    <div>
                      <strong>${newTickets}টি নতুন টিকেট</strong><br>
                      <small style="color:var(--gray-500);font-size:11px;">কাস্টমার সাপোর্ট</small>
                    </div>
                  </a>
                </li>` : ''}
              ${(pendingCount + newTickets) === 0 ? `
                <li><div style="padding:16px;text-align:center;color:var(--gray-500);font-size:13px;">কোনো নতুন নোটিফিকেশন নেই</div></li>
              ` : ''}
            </ul>
          </div>
        </div>

        <button class="icon-btn" onclick="confirmAdminLogout()" title="লগআউট" style="color:var(--red-500);">
          <i class="fa-solid fa-power-off"></i>
        </button>

        <div class="profile-dropdown">
          <div class="topbar-avatar" onclick="toggleProfileMenu(event)" title="প্রোফাইল" style="cursor:pointer;">
            ${initial}
          </div>
          <div class="profile-menu" id="profileMenu">
            <div class="profile-menu-head">
              <strong>${admin.name}</strong>
              <small>${admin.email} · ${userRole}</small>
            </div>
            <ul class="profile-menu-list">
              <li>
                <a href="settings.html">
                  <i class="fa-solid fa-user-gear"></i> প্রোফাইল সেটিংস
                </a>
              </li>
              <li>
                <button onclick="confirmAdminLogout()" class="text-danger">
                  <i class="fa-solid fa-power-off"></i> লগআউট
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  `;

  // ============================================
  // Mobile bottom nav
  // ============================================
  const bottomNavHTML = `
    <div class="mobile-bottom-nav">
      <a href="dashboard.html" class="${path === 'dashboard.html' ? 'active' : ''}">
        <i class="fa-solid fa-gauge-high"></i>
        <span>হোম</span>
      </a>
      <a href="orders.html" class="${path === 'orders.html' || path === 'order-detail.html' ? 'active' : ''}">
        <i class="fa-solid fa-cart-shopping"></i>
        <span>অর্ডার</span>
        ${pendingCount > 0 ? `<span class="badge-count">${pendingCount}</span>` : ''}
      </a>
      <a href="products.html" class="${path === 'products.html' || path === 'product-form.html' ? 'active' : ''}">
        <i class="fa-solid fa-box"></i>
        <span>পণ্য</span>
      </a>
      <a href="settings.html" class="${path === 'settings.html' ? 'active' : ''}">
        <i class="fa-solid fa-user-gear"></i>
        <span>প্রোফাইল</span>
      </a>
    </div>
  `;

  // ============================================
  // Inject
  // ============================================
  function inject() {
    const sidebarSlot = document.getElementById('admin-sidebar');
    if (sidebarSlot) sidebarSlot.outerHTML = sidebarHTML;

    const topbarSlot = document.getElementById('admin-topbar');
    if (topbarSlot) topbarSlot.outerHTML = topbarHTML;

    document.body.insertAdjacentHTML('beforeend', bottomNavHTML);

    // Page title
    const pageTitle = document.body.dataset.title || 'ড্যাশবোর্ড';
    const titleEl = document.getElementById('topbarTitle');
    if (titleEl) titleEl.textContent = pageTitle;
    document.title = pageTitle + ' — কাচাবাজার Admin';

    // ✅ PWA meta — dedupe safety
    if (!document.querySelector('link[rel="manifest"]')) {
      const m = document.createElement('link');
      m.rel = 'manifest';
      m.href = '/admin/admin-manifest.json';
      document.head.appendChild(m);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      const t = document.createElement('meta');
      t.name = 'theme-color';
      t.content = '#16a34a';
      document.head.appendChild(t);
    }
  }

  // ============================================
  // Global UI handlers
  // ============================================
  function toggleSidebar() {
    document.getElementById('adminSidebar')?.classList.toggle('open');
    document.getElementById('sidebarOverlay')?.classList.toggle('show');
  }

  function closeSidebar() {
    document.getElementById('adminSidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('show');
  }

  function toggleProfileMenu(e) {
    e.stopPropagation();
    document.getElementById('notifMenu')?.classList.remove('show');
    document.getElementById('profileMenu')?.classList.toggle('show');
  }

  function toggleNotifMenu(e) {
    e.stopPropagation();
    document.getElementById('profileMenu')?.classList.remove('show');
    document.getElementById('notifMenu')?.classList.toggle('show');
  }

  document.addEventListener('click', function (e) {
    const pMenu = document.getElementById('profileMenu');
    const nMenu = document.getElementById('notifMenu');
    if (pMenu?.classList.contains('show') && !e.target.closest('.profile-dropdown')) {
      pMenu.classList.remove('show');
    }
    if (nMenu?.classList.contains('show') && !e.target.closest('.profile-dropdown')) {
      nMenu.classList.remove('show');
    }
  });

  // Expose
  window.toggleSidebar = toggleSidebar;
  window.closeSidebar = closeSidebar;
  window.toggleProfileMenu = toggleProfileMenu;
  window.toggleNotifMenu = toggleNotifMenu;

  // Inject on ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();

// ============================================
// Dropdown group toggle — global
// ============================================
function toggleMenuGroup(groupId, event) {
  if (event) event.stopPropagation();
  const groupEl = event.currentTarget.closest('.nav-group');
  if (!groupEl) return;

  let openList = [];
  try {
    openList = JSON.parse(localStorage.getItem('kc_admin_open_groups') || '[]');
    if (!Array.isArray(openList)) openList = [];
  } catch {
    openList = [];
  }

  const isOpen = groupEl.classList.contains('open');
  if (isOpen) {
    groupEl.classList.remove('open');
    openList = openList.filter(id => id !== groupId);
  } else {
    groupEl.classList.add('open');
    if (!openList.includes(groupId)) openList.push(groupId);
  }

  localStorage.setItem('kc_admin_open_groups', JSON.stringify(openList));
}

// ============================================
// Logout confirm modal
// ============================================
function confirmAdminLogout() {
  if (!document.getElementById('adminLogoutModal')) {
    const modalHTML = `
      <div class="modal-overlay" id="adminLogoutModal">
        <div class="modal" style="max-width:380px;text-align:center;">
          <div class="modal-body" style="padding:30px 20px 20px;">
            <div style="width:60px;height:60px;background:#fef2f2;color:var(--red-500);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px;">
              <i class="fa-solid fa-power-off"></i>
            </div>
            <h3 style="font-size:18px;margin-bottom:8px;color:var(--gray-900);">লগআউট করতে চান?</h3>
            <p style="color:var(--gray-500);font-size:14px;margin-bottom:24px;">আপনি কি সত্যিই অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?</p>
            <div style="display:flex;gap:10px;justify-content:center;">
              <button class="btn btn-secondary" style="flex:1;justify-content:center;" onclick="closeAdminLogoutModal()">না, থাকবো</button>
              <button class="btn btn-danger" style="flex:1;justify-content:center;" onclick="executeAdminLogout()">হ্যাঁ, লগআউট</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  document.getElementById('adminLogoutModal').classList.add('show');
}

function closeAdminLogoutModal() {
  document.getElementById('adminLogoutModal')?.classList.remove('show');
}

function executeAdminLogout() {
  // Supabase sign-out (available হলে)
  try {
    if (window.__supabaseClient) {
      window.__supabaseClient.auth.signOut().catch(() => {});
    }
  } catch (e) { /* ignore */ }

  localStorage.removeItem('kc_admin_user');
  location.href = 'index.html';
}

// Global expose
window.confirmAdminLogout = confirmAdminLogout;
window.closeAdminLogoutModal = closeAdminLogoutModal;
window.executeAdminLogout = executeAdminLogout;
window.toggleMenuGroup = toggleMenuGroup;