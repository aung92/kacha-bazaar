// ============================================
// ADMIN UTILS — v3.1 (SAFE GUARD)
// FIXED: AdminStore undefined হলে crash হবে না
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

function formatTk(n) {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return '৳' + Number(n || 0).toLocaleString('en-US').replace(/\d/g, d => bn[+d]);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const months = ['জানু','ফেব','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ','অক্টো','নভে','ডিসে'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

// Status badge
function statusBadge(status) {
  const map = {
    pending: { cls: 'badge-pending', label: 'অপেক্ষমাণ' },
    confirmed: { cls: 'badge-confirmed', label: 'কনফার্ম' },
    packed: { cls: 'badge-packed', label: 'প্যাকড' },
    shipped: { cls: 'badge-shipped', label: 'শিপড' },
    delivered: { cls: 'badge-delivered', label: 'ডেলিভার্ড' },
    cancelled: { cls: 'badge-cancelled', label: 'বাতিল' }
  };
  const s = map[status] || map.pending;
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

function stockBadge(stock) {
  const n = Number(stock) || 0;
  if (n === 0) return `<span class="badge badge-out">শেষ</span>`;
  if (n < 10) return `<span class="badge badge-low">${n}</span>`;
  return `<span class="badge badge-active">${n}</span>`;
}

// ✅ Number → বাংলা কথায়
function numberToBanglaWords(num) {
  if (!num || num <= 0) return 'শূন্য টাকা মাত্র';
  const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
    'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'ঊনিশ'];
  const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

  function twoDigit(n) {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? ' ' + ones[o] : '');
  }
  function threeDigit(n) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    let str = '';
    if (h) str += ones[h] + 'শত';
    if (r) str += (str ? ' ' : '') + twoDigit(r);
    return str;
  }

  const taka = Math.floor(num);
  const poisha = Math.round((num - taka) * 100);
  const crore = Math.floor(taka / 10000000);
  const lakh = Math.floor((taka % 10000000) / 100000);
  const thousand = Math.floor((taka % 100000) / 1000);
  const rest = taka % 1000;

  let result = '';
  if (crore) result += threeDigit(crore) + ' কোটি';
  if (lakh) result += (result ? ' ' : '') + twoDigit(lakh) + ' লক্ষ';
  if (thousand) result += (result ? ' ' : '') + twoDigit(thousand) + ' হাজার';
  if (rest) result += (result ? ' ' : '') + threeDigit(rest);
  if (!result) result = 'শূন্য';
  result += ' টাকা';
  if (poisha) result += ' ' + twoDigit(poisha) + ' পয়সা';
  return result + ' মাত্র';
}

// ✅ Theme apply — theme-settings.html থেকে সেভ হলে frontend/admin-এ CSS var apply
function applyThemeFromStorage() {
  // ✅ Safe guard: AdminStore না থাকলে return
  if (typeof AdminStore === 'undefined') return;

  const t = AdminStore.get('theme_settings', null);
  if (!t) return;

  const root = document.documentElement;
  if (t.primary) {
    root.style.setProperty('--green-600', t.primary);
    root.style.setProperty('--green-700', t.primary);
    root.style.setProperty('--green-500', t.primary);
  }
  if (t.secondary) {
    root.style.setProperty('--orange-500', t.secondary);
    root.style.setProperty('--orange-600', t.secondary);
  }
  if (t.font) {
    root.style.setProperty('--font-bn', `'${t.font}', sans-serif`);
    if (document.body) {
      document.body.style.fontFamily = `'${t.font}', 'Hind Siliguri', sans-serif`;
    }
  }
}

// ✅ পেজ লোডে auto-apply — safe guard সহ
(function () {
  if (typeof document === 'undefined') return;

  const safeApply = () => {
    if (typeof AdminStore !== 'undefined') {
      applyThemeFromStorage();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeApply);
  } else {
    // DOM already ready, তবে AdminStore হয়তো এখনো define হয়নি
    // → পরের tick-এ apply করি
    setTimeout(safeApply, 0);
  }
})();
// ============================================
// GLOBAL CONFIRM MODAL FUNCTION
// ============================================
window.showConfirmModal = function(options) {
  const { 
    title = 'নিশ্চিত করুন', 
    message = 'আপনি কি সত্যিই এটি করতে চান?', 
    confirmText = 'হ্যাঁ, নিশ্চিত', 
    cancelText = 'না, বাতিল', 
    type = 'danger', 
    onConfirm = () => {},
    onCancel = () => {}
  } = options;

  // পুরনো মডাল থাকলে মুছে ফেলা
  const existing = document.getElementById('globalConfirmModal');
  if (existing) existing.remove();

  // আইকন সেটআপ
  let iconClass = 'fa-triangle-exclamation';
  if (type === 'success') iconClass = 'fa-check';
  if (type === 'info') iconClass = 'fa-circle-info';

  // মডাল HTML তৈরি
  const modalHTML = `
    <div class="global-modal-overlay" id="globalConfirmModal">
      <div class="global-modal-box">
        <div class="global-modal-icon ${type}">
          <i class="fa-solid ${iconClass}"></i>
        </div>
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="global-modal-actions">
          <button class="btn-modal-cancel" id="globalModalCancel">${cancelText}</button>
          <button class="btn-modal-confirm ${type}" id="globalModalConfirm">${confirmText}</button>
        </div>
      </div>
    </div>
  `;

  // বডিতে যুক্ত করা
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = document.getElementById('globalConfirmModal');

  // অ্যানিমেশন দেখানোর জন্য সামান্য দেরি
  setTimeout(() => modal.classList.add('show'), 10);

  // বাটন ইভেন্ট
  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  };

  document.getElementById('globalModalCancel').onclick = () => {
    closeModal();
    onCancel();
  };

  document.getElementById('globalModalConfirm').onclick = () => {
    closeModal();
    onConfirm();
  };
};