// ============================================
// ADMIN ORDERS — v4.5 (Fixed Barcode Printing)
// ============================================

(async () => {
  if (typeof requireAdmin === 'function') requireAdmin();

  let allOrders = [];
  let activeStatus = 'all';
  let currentPrintOrder = null;
  let currentFilteredList = []; 

  const PAYMENT_LABELS = {
    cod: 'ক্যাশ অন ডেলিভারি', bkash: 'বিকাশ', nagad: 'নগদ', card: 'কার্ড', aamarpay: 'aamarPay'
  };
  const STATUS_LABELS = {
    pending: 'অপেক্ষমাণ', confirmed: 'কনফার্ম', packed: 'প্যাকড', 
    shipped: 'শিপড', delivered: 'ডেলিভার্ড', cancelled: 'বাতিল'
  };

  // ============================================
  // ১. Load Data From Supabase
  // ============================================
  async function loadOrders() {
    const body = document.getElementById('ordersBody');
    if (body) body.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--gray-500)"><i class="fa-solid fa-spinner fa-spin"></i> অর্ডার লোড হচ্ছে...</td></tr>';

    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      allOrders = (data || []).map(o => ({
        id: o.order_number || String(o.id),
        db_id: o.id,
        customer: o.customer_name,
        phone: o.customer_phone,
        address: o.customer_address,
        area: o.area,
        slot: o.delivery_slot,
        date: o.created_at,
        items: (o.order_items || []).length,
        subtotal: Number(o.subtotal),
        delivery: Number(o.delivery),
        total: Number(o.total),
        status: o.status,
        payment: o.payment_method,
        paid: o.payment_status === 'paid',
        items_detail: o.order_items || []
      }));

      updateCounts();
      applyFilters();

    } catch (err) {
      console.error('Order load error:', err);
      if (body) body.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--red-500)">অর্ডার লোড ব্যর্থ: ${err.message}</td></tr>`;
    }
  }

  // ============================================
  // ২. Filters & Render
  // ============================================
  function updateCounts() {
    const c = (s) => allOrders.filter(o => o.status === s).length;
    ['All','Pending','Confirmed','Packed','Shipped','Delivered','Cancelled'].forEach((label, i) => {
      const el = document.getElementById('count' + label);
      if (el) el.textContent = i === 0 ? allOrders.length : c(label.toLowerCase());
    });
  }

  function applyFilters() {
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const payment = document.getElementById('filterPayment')?.value || '';
    const sort = document.getElementById('sortBy')?.value || 'newest';

    let list = allOrders.slice();
    if (activeStatus !== 'all') list = list.filter(o => o.status === activeStatus);
    if (payment) list = list.filter(o => o.payment === payment);
    if (search) {
      list = list.filter(o =>
        o.id.toLowerCase().includes(search) ||
        (o.customer || '').toLowerCase().includes(search) ||
        (o.phone || '').includes(search)
      );
    }

    if (sort === 'newest') list.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sort === 'oldest') list.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sort === 'amount-high') list.sort((a, b) => b.total - a.total);
    if (sort === 'amount-low') list.sort((a, b) => a.total - b.total);

    currentFilteredList = list; 
    renderTable(list);
  }

  function renderTable(list) {
    const body = document.getElementById('ordersBody');
    if (!body) return;
    if (!list.length) {
      body.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--gray-500)">কোনো অর্ডার নেই</td></tr>';
      return;
    }
    body.innerHTML = list.map(o => `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.customer}<br><small style="color:var(--gray-500)">${o.phone}</small></td>
        <td>${formatDate(o.date)}</td>
        <td>${o.items || 1}টি</td>
        <td><strong>${formatTk(o.total)}</strong></td>
        <td>${PAYMENT_LABELS[o.payment] || o.payment}<br><span class="badge ${o.paid ? 'badge-paid' : 'badge-unpaid'}">${o.paid ? 'পেইড' : 'আনপেইড'}</span></td>
        <td>
          <select class="quick-status" onchange="quickStatusUpdate('${o.id}', this.value)" style="padding:5px 8px;border-radius:6px;border:1px solid var(--gray-200);font-size:12px;font-family:inherit;cursor:pointer">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>অপেক্ষমাণ</option>
            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>কনফার্ম</option>
            <option value="packed" ${o.status === 'packed' ? 'selected' : ''}>প্যাকড</option>
            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>শিপড</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>ডেলিভার্ড</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>বাতিল</option>
          </select>
        </td>
        <td class="actions">
          <button onclick="viewOrderDetails('${o.id}')" title="বিস্তারিত"><i class="fa-solid fa-eye"></i></button>
          <button onclick="showPrintOptions('${o.id}')" title="প্রিন্ট"><i class="fa-solid fa-print"></i></button>
          <button class="del" onclick="cancelOrder('${o.id}', ${o.db_id})" title="বাতিল"><i class="fa-solid fa-xmark"></i></button>
        </td>
      </tr>
    `).join('');
  }

  // ============================================
  // ৩. ✅ সব স্লিপ একসাথে প্রিন্ট (Custom Popup Confirm)
  // ============================================
  window.printAllSlips = () => {
    if (!currentFilteredList.length) {
      showToast('প্রিন্ট করার জন্য কোনো অর্ডার নেই', 'error');
      return;
    }

    const existingModal = document.getElementById('printAllConfirmModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div class="custom-confirm-modal" id="printAllConfirmModal">
        <div class="custom-confirm-box">
          <div class="custom-confirm-icon" style="background:#dbeafe; color:#2563eb;">
            <i class="fa-solid fa-print"></i>
          </div>
          <h3>সব স্লিপ প্রিন্ট করবেন?</h3>
          <p>আপনি কি বর্তমানে দৃশ্যমান <strong>${currentFilteredList.length}টি</strong> অর্ডারের প্যাকিং স্লিপ একসাথে প্রিন্ট করতে চান?</p>
          <div class="custom-confirm-actions">
            <button class="btn-no" onclick="document.getElementById('printAllConfirmModal').remove()">না, বাতিল করুন</button>
            <button class="btn-yes" style="background:var(--green-600);" onclick="executePrintAllSlips()">হ্যাঁ, প্রিন্ট করুন</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => document.getElementById('printAllConfirmModal').classList.add('show'), 10);
  };

  window.executePrintAllSlips = () => {
    document.getElementById('printAllConfirmModal').remove();
    
    // মডাল বন্ধ হওয়ার পর প্রিন্ট উইন্ডো ওপেন করা
    setTimeout(() => {
      const win = window.open('', '_blank');
      
      const slipsHtml = currentFilteredList.map(o => {
        const items = o.items_detail || [];
        return `
          <div class="slip-page">
            <div class="header">
              <div class="brand">কাচা<span>বাজার</span></div>
              <div class="subtitle">৩ পার্বত্য জেলা থেকে তাজা পণ্য</div>
              <div class="slip-title">PACKING SLIP</div>
            </div>

            <div class="info-row">
              <span>Order ID:</span>
              <strong>#${o.id}</strong>
            </div>
            <div class="info-row">
              <span>Date:</span>
              <strong>${formatDate(o.date)}</strong>
            </div>
            ${o.slot ? `<div class="info-row"><span>Slot:</span><strong>${o.slot}</strong></div>` : ''}

            <div class="customer-box">
              <div class="customer-name">${o.customer}</div>
              <div class="customer-details">
                <p><strong>Phone:</strong> ${o.phone}</p>
                <p><strong>Address:</strong> ${o.address}${o.area ? `, ${o.area}` : ''}</p>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th class="check">✓</th>
                  <th>Item Name</th>
                  <th style="text-align:center">Qty</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(it => `
                  <tr>
                    <td class="check">☐</td>
                    <td>
                      <strong>${it.name}</strong><br>
                      <small style="color:#6b7280;">${it.unit || ''}</small>
                    </td>
                    <td class="qty">${it.qty}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="text-align:center; font-weight:700; font-size:13px; margin-bottom:15px;">
              Total Items: ${items.length} টি
            </div>

            <div class="barcode-section">
              <img class="barcode-img" data-order="${o.id}" style="max-width: 100%; height: 45px;">
              <div class="barcode-text">${o.id}</div>
            </div>

            <div class="footer">
              <div><strong>Packed By:</strong> __________________</div>
              <div style="margin-top: 10px;">ধন্যবাদ! আমাদের সাথে কেনাকাটার জন্য।</div>
            </div>
          </div>
        `;
      }).join('');

      win.document.write(`
        <html>
        <head>
          <title>All Packing Slips</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;600;700&display=swap');
            @page { size: 4in 6in; margin: 0; }
            body { font-family: 'Hind Siliguri', Arial, sans-serif; padding: 0; margin: 0; background: #fff; }
            .slip-page { width: 4in; height: 6in; padding: 15px; box-sizing: border-box; page-break-after: always; background: #fff; color: #1a1a1a; font-size: 12px; line-height: 1.4; margin: 0 auto; overflow: hidden; }
            .slip-page:last-child { page-break-after: auto; }
            .header { text-align: center; margin-bottom: 12px; border-bottom: 2px dashed #111; padding-bottom: 10px; }
            .brand { font-size: 24px; font-weight: 700; color: #111; letter-spacing: -0.5px; margin-bottom: 2px; }
            .brand span { color: #16a34a; }
            .subtitle { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .slip-title { display: inline-block; background: #111; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 4px; letter-spacing: 1px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
            .info-row strong { font-weight: 700; }
            .customer-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin: 12px 0; background: #f9fafb; }
            .customer-name { font-size: 16px; font-weight: 700; border-bottom: 1px dashed #d1d5db; padding-bottom: 5px; margin-bottom: 5px; color: #111; }
            .customer-details p { margin: 2px 0; font-size: 12px; }
            .customer-details strong { font-weight: 600; color: #374151; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            .table th { border-bottom: 2px solid #111; padding: 6px 4px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4b5563; }
            .table td { border-bottom: 1px solid #e5e7eb; padding: 8px 4px; font-size: 12px; vertical-align: top; }
            .table td.check { width: 20px; font-size: 14px; text-align: center; vertical-align: middle; color: #9ca3af; }
            .table td.qty { text-align: center; font-weight: 700; white-space: nowrap; }
            .barcode-section { text-align: center; border-top: 2px dashed #111; border-bottom: 2px dashed #111; padding: 10px 0; margin: 15px 0; }
            .barcode-text { font-family: 'Inter', monospace; font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #4b5563; margin-top: 4px; }
            .footer { text-align: center; font-size: 10px; color: #6b7280; margin-top: 15px; }
            .footer strong { color: #111; }
            @media print { 
              body { padding: 0; margin: 0; } 
              img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${slipsHtml}
          <script>
            window.onload = function() { 
              // ১. বারকোড জেনারেট করা
              if (typeof JsBarcode !== 'undefined') {
                document.querySelectorAll('.barcode-img').forEach(function(img) {
                  var orderId = img.getAttribute('data-order');
                  var canvas = document.createElement('canvas');
                  JsBarcode(canvas, orderId, { format: "CODE128", width: 1.5, height: 45, displayValue: false, margin: 0 });
                  img.src = canvas.toDataURL("image/png");
                });
              }
              // ২. বারকোড ইমেজ লোড হওয়ার জন্য ১.৫ সেকেন্ড অপেক্ষা করা
              setTimeout(function() { 
                window.print(); 
              }, 1500);
            }
          <\/script>
        </body>
        </html>
      `);
      win.document.close();
    }, 200);
  };

  // ============================================
  // ৪. অর্ডার ডিটেইলস পপআপ
  // ============================================
  window.viewOrderDetails = (orderId) => {
    const o = allOrders.find(x => x.id === orderId);
    if (!o) return;
    
    currentPrintOrder = o;

    document.getElementById('odTitle').textContent = 'অর্ডার #' + o.id;

    let itemsHtml = '';
    if (o.items_detail && o.items_detail.length) {
      itemsHtml = o.items_detail.map(it => `
        <div class="od-item">
          <div>
            <strong>${it.name}</strong> <br>
            <small style="color:var(--gray-500)">${it.qty} ${it.unit || 'টি'} × ${formatTk(it.price)}</small>
          </div>
          <div style="font-weight:600">${formatTk(it.price * it.qty)}</div>
        </div>
      `).join('');
    } else {
      itemsHtml = '<p style="color:var(--gray-500)">পণ্যের বিস্তারিত নেই</p>';
    }

    document.getElementById('orderDetailContent').innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div>
          <div class="od-section-title">কাস্টমার তথ্য</div>
          <p style="font-size:14px; margin-bottom:4px;"><strong>${o.customer}</strong></p>
          <p style="font-size:14px; color:var(--gray-600); margin-bottom:4px;"><i class="fa-solid fa-phone" style="width:16px"></i> ${o.phone}</p>
          <p style="font-size:14px; color:var(--gray-600); margin-bottom:4px;"><i class="fa-solid fa-location-dot" style="width:16px"></i> ${o.address}</p>
          ${o.area ? `<p style="font-size:14px; color:var(--gray-600); margin-bottom:4px;"><i class="fa-solid fa-map" style="width:16px"></i> ${o.area}</p>` : ''}
        </div>
        <div>
          <div class="od-section-title">পেমেন্ট ও ডেলিভারি</div>
          <p style="font-size:14px; margin-bottom:6px;">পেমেন্ট: <strong>${PAYMENT_LABELS[o.payment] || o.payment}</strong> (${o.paid ? 'পেইড' : 'আনপেইড'})</p>
          <p style="font-size:14px; margin-bottom:6px;">স্ট্যাটাস: ${statusBadge(o.status)}</p>
          <p style="font-size:14px; margin-bottom:6px;">তারিখ: ${formatDate(o.date)}</p>
          ${o.slot ? `<p style="font-size:14px; margin-bottom:6px;">স্লট: ${o.slot}</p>` : ''}
        </div>
      </div>

      <div class="od-section-title">পণ্যসমূহ</div>
      <div style="background:var(--gray-50); padding:0 14px; border-radius:8px; border:1px solid var(--gray-200);">
        ${itemsHtml}
      </div>

      <div style="margin-top:16px; display:flex; justify-content:space-between; font-size:14px;">
        <span>সাবটোটাল:</span>
        <strong>${formatTk(o.subtotal)}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:14px; margin-top:4px;">
        <span>ডেলিভারি:</span>
        <strong>${o.delivery === 0 ? 'ফ্রি' : formatTk(o.delivery)}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:700; color:var(--green-700); margin-top:8px; padding-top:8px; border-top:1px dashed var(--gray-300);">
        <span>সর্বমোট:</span>
        <strong>${formatTk(o.total)}</strong>
      </div>
    `;

    document.getElementById('orderDetailModal').classList.add('show');
  };

  // ============================================
  // ৫. প্রিন্ট অপশন পপআপ (Single Print)
  // ============================================
  window.showPrintOptions = (orderId) => {
    const existingModal = document.getElementById('printOptionsModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div class="modal-overlay" id="printOptionsModal">
        <div class="modal" style="max-width:400px;">
          <div class="modal-head" style="border-bottom:none;">
            <h3><i class="fa-solid fa-print" style="color:var(--green-600)"></i> প্রিন্ট অপশন</h3>
            <button class="close-modal" onclick="closeModal('printOptionsModal')">×</button>
          </div>
          <div class="modal-body" style="padding-top:0;">
            <p style="font-size:13px; color:var(--gray-500); margin-bottom:16px;">অর্ডার <strong>#${orderId}</strong> এর জন্য কী প্রিন্ট করতে চান?</p>
            
            <div style="display:flex; flex-direction:column; gap:10px;">
              <button onclick="doDirectPrint('${orderId}')" style="display:flex; align-items:center; gap:14px; padding:14px; border:1px solid var(--gray-200); border-radius:10px; background:#fff; cursor:pointer; text-align:left; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--green-500)'; this.style.background='var(--green-50)'" onmouseout="this.style.borderColor='var(--gray-200)'; this.style.background='#fff'">
                <div style="width:40px; height:40px; background:#dbeafe; color:#2563eb; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">
                  <i class="fa-solid fa-file-invoice"></i>
                </div>
                <div>
                  <strong style="display:block; font-size:14px; color:var(--gray-900);">A4 ইনভয়েস</strong>
                  <small style="color:var(--gray-500); font-size:12px;">কাস্টমারের জন্য বিস্তারিত বিল</small>
                </div>
              </button>

              <button onclick="doPackingSlip('${orderId}')" style="display:flex; align-items:center; gap:14px; padding:14px; border:1px solid var(--gray-200); border-radius:10px; background:#fff; cursor:pointer; text-align:left; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--green-500)'; this.style.background='var(--green-50)'" onmouseout="this.style.borderColor='var(--gray-200)'; this.style.background='#fff'">
                <div style="width:40px; height:40px; background:#fef3c7; color:#b45309; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">
                  <i class="fa-solid fa-box"></i>
                </div>
                <div>
                  <strong style="display:block; font-size:14px; color:var(--gray-900);">প্যাকিং স্লিপ</strong>
                  <small style="color:var(--gray-500); font-size:12px;">বারকোড সহ প্যাকিং চেকলিস্ট</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => document.getElementById('printOptionsModal').classList.add('show'), 10);
  };

  // A4 ইনভয়েস সরাসরি প্রিন্ট
  window.doDirectPrint = (orderId) => {
    const o = allOrders.find(x => x.id === orderId);
    if (!o) return;
    closeModal('printOptionsModal');
    renderHiddenInvoice(o);
    setTimeout(() => window.print(), 200);
  };

  // প্যাকিং স্লিপ (Single)
  window.doPackingSlip = (orderId) => {
    const o = allOrders.find(x => x.id === orderId);
    if (!o) return;
    closeModal('printOptionsModal');

    const items = o.items_detail || [];
    const win = window.open('', '_blank');
    
    win.document.write(`
      <html>
      <head>
        <title>Packing Slip #${o.id}</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;600;700&display=swap');
          @page { size: 4in 6in; margin: 0; }
          body { font-family: 'Hind Siliguri', Arial, sans-serif; padding: 15px; color: #1a1a1a; max-width: 4in; margin: 0 auto; font-size: 12px; line-height: 1.4; background: #fff; }
          .header { text-align: center; margin-bottom: 12px; border-bottom: 2px dashed #111; padding-bottom: 10px; }
          .brand { font-size: 24px; font-weight: 700; color: #111; letter-spacing: -0.5px; margin-bottom: 2px; }
          .brand span { color: #16a34a; }
          .subtitle { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .slip-title { display: inline-block; background: #111; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 4px; letter-spacing: 1px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
          .info-row strong { font-weight: 700; }
          .customer-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin: 12px 0; background: #f9fafb; }
          .customer-name { font-size: 16px; font-weight: 700; border-bottom: 1px dashed #d1d5db; padding-bottom: 5px; margin-bottom: 5px; color: #111; }
          .customer-details p { margin: 2px 0; font-size: 12px; }
          .customer-details strong { font-weight: 600; color: #374151; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          .table th { border-bottom: 2px solid #111; padding: 6px 4px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4b5563; }
          .table td { border-bottom: 1px solid #e5e7eb; padding: 8px 4px; font-size: 12px; vertical-align: top; }
          .table td.check { width: 20px; font-size: 14px; text-align: center; vertical-align: middle; color: #9ca3af; }
          .table td.qty { text-align: center; font-weight: 700; white-space: nowrap; }
          .barcode-section { text-align: center; border-top: 2px dashed #111; border-bottom: 2px dashed #111; padding: 10px 0; margin: 15px 0; }
          .barcode-text { font-family: 'Inter', monospace; font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #4b5563; margin-top: 4px; }
          .footer { text-align: center; font-size: 10px; color: #6b7280; margin-top: 15px; }
          .footer strong { color: #111; }
          @media print { body { padding: 0; margin: 0; max-width: 100%; } .customer-box { border: 1px solid #e5e7eb; } img { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">কাচা<span>বাজার</span></div>
          <div class="subtitle">৩ পার্বত্য জেলা থেকে তাজা পণ্য</div>
          <div class="slip-title">PACKING SLIP</div>
        </div>
        <div class="info-row"><span>Order ID:</span><strong>#${o.id}</strong></div>
        <div class="info-row"><span>Date:</span><strong>${formatDate(o.date)}</strong></div>
        ${o.slot ? `<div class="info-row"><span>Slot:</span><strong>${o.slot}</strong></div>` : ''}
        <div class="customer-box">
          <div class="customer-name">${o.customer}</div>
          <div class="customer-details">
            <p><strong>Phone:</strong> ${o.phone}</p>
            <p><strong>Address:</strong> ${o.address}${o.area ? `, ${o.area}` : ''}</p>
          </div>
        </div>
        <table class="table">
          <thead><tr><th class="check">✓</th><th>Item Name</th><th style="text-align:center">Qty</th></tr></thead>
          <tbody>
            ${items.map(it => `
              <tr>
                <td class="check">☐</td>
                <td><strong>${it.name}</strong><br><small style="color:#6b7280;">${it.unit || ''}</small></td>
                <td class="qty">${it.qty}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="text-align:center; font-weight:700; font-size:13px; margin-bottom:15px;">Total Items: ${items.length} টি</div>
        <div class="barcode-section">
          <img id="barcodeImg" style="max-width: 100%; height: 45px;">
          <div class="barcode-text">${o.id}</div>
        </div>
        <div class="footer">
          <div><strong>Packed By:</strong> __________________</div>
          <div style="margin-top: 10px;">ধন্যবাদ! আমাদের সাথে কেনাকাটার জন্য।</div>
        </div>
        <script>
          window.onload = function() { 
            if (typeof JsBarcode !== 'undefined') {
              var canvas = document.createElement('canvas');
              JsBarcode(canvas, "${o.id}", { format: "CODE128", width: 1.5, height: 45, displayValue: false, margin: 0 });
              document.getElementById('barcodeImg').src = canvas.toDataURL("image/png");
            }
            setTimeout(function() { window.print(); }, 1500);
          }
        <\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // ============================================
  // ৬. লুকানো ইনভয়েস রেন্ডার (A4 প্রিন্টের জন্য)
  // ============================================
  function renderHiddenInvoice(order) {
    const area = document.getElementById('invoicePrintArea');
    const orderDate = formatDate(order.date);
    const items = order.items_detail || [];
    const isPaid = order.paid;
    
    function numberToBanglaWords(num) {
      if (!num || num <= 0) return 'শূন্য টাকা মাত্র';
      const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'ঊনিশ'];
      const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
      function twoDigit(n) { if (n < 20) return ones[n]; const t = Math.floor(n / 10); const o = n % 10; return tens[t] + (o ? ' ' + ones[o] : ''); }
      function threeDigit(n) { const h = Math.floor(n / 100); const r = n % 100; let str = ''; if (h) str += ones[h] + 'শত'; if (r) str += (str ? ' ' : '') + twoDigit(r); return str; }
      const taka = Math.floor(num);
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
      return result + ' টাকা মাত্র';
    }

    const amountWords = numberToBanglaWords(order.total);

    const itemRows = items.map((it, idx) => `
      <tr>
        <td class="center">${idx + 1}</td>
        <td>
          <strong>${it.name}</strong><br>
          <span style="font-size: 11px; color: #6b7280;">একক: ${it.unit || 'কেজি'}</span>
        </td>
        <td class="center">${it.qty}</td>
        <td class="right">${formatTk(it.price)}</td>
        <td class="right">${formatTk(it.price * it.qty)}</td>
      </tr>
    `).join('');

    area.innerHTML = `
      <div class="inv-container">
        <div class="inv-header">
          <div class="inv-brand">
            <div class="inv-logo-box">ক</div>
            <div class="inv-brand-text">
              <h1>কাচা<span>বাজার</span></h1>
              <p>৩ পার্বত্য জেলা থেকে সরাসরি তাজা পণ্য</p>
            </div>
          </div>
          <div class="inv-meta">
            <div class="inv-title">INVOICE</div>
            <div class="inv-meta-box">
              <div><span>ইনভয়েস নং:</span><span>#${order.id}</span></div>
              <div><span>তারিখ:</span><span>${orderDate}</span></div>
              <div><span>স্ট্যাটাস:</span><span>${STATUS_LABELS[order.status] || order.status}</span></div>
              <div><span>পেমেন্ট:</span><span>${isPaid ? 'পেইড ✅' : 'আনপেইড ⏳'}</span></div>
            </div>
          </div>
        </div>

        <div class="inv-parties">
          <div class="inv-party">
            <h4>বিল টু / Bill To</h4>
            <p><strong>${order.customer}</strong></p>
            <p><i class="fa-solid fa-phone" style="width:14px; color:#16a34a;"></i> ${order.phone}</p>
            <p><i class="fa-solid fa-location-dot" style="width:14px; color:#16a34a;"></i> ${order.address}</p>
            ${order.area ? `<p><strong>এলাকা:</strong> ${order.area}</p>` : ''}
          </div>
          <div class="inv-party">
            <h4>পেমেন্ট তথ্য / Payment Info</h4>
            <p><strong>পদ্ধতি:</strong> ${PAYMENT_LABELS[order.payment] || order.payment}</p>
            <p><strong>ডেলিভারি স্লট:</strong> ${order.slot || '—'}</p>
            <p><strong>ডেলিভারি চার্জ:</strong> ${order.delivery === 0 ? 'ফ্রি' : formatTk(order.delivery)}</p>
            <p><strong>অর্ডারের তারিখ:</strong> ${orderDate}</p>
          </div>
        </div>

        <div class="inv-table-wrap">
          <table class="inv-table">
            <thead>
              <tr>
                <th class="center" style="width: 5%;">#</th>
                <th style="width: 45%;">পণ্যের নাম</th>
                <th class="center" style="width: 10%;">পরিমাণ</th>
                <th class="right" style="width: 20%;">একক দাম</th>
                <th class="right" style="width: 20%;">মোট</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
        </div>

        <div class="inv-summary-wrap">
          <div class="inv-summary-left">
            <div class="amount-words">
              <strong>কথায় পরিমাণ / Amount in Words</strong>
              ${amountWords}
            </div>
          </div>
          <div class="inv-summary-right">
            <div class="summary-row">
              <span>সাবটোটাল (${items.length}টি পণ্য)</span>
              <span>${formatTk(order.subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>ডেলিভারি চার্জ</span>
              <span>${order.delivery === 0 ? 'ফ্রি' : formatTk(order.delivery)}</span>
            </div>
            <div class="summary-row grand">
              <span>সর্বমোট</span>
              <span>${formatTk(order.total)}</span>
            </div>
          </div>
        </div>

        <div class="inv-footer">
          <div class="thanks">🙏 ধন্যবাদ! আমাদের সাথে কেনাকাটার জন্য।</div>
          <div class="policy">পণ্য সংক্রান্ত যেকোনো অভিযোগ বা রিটার্নের জন্য ২৪ ঘণ্টার মধ্যে যোগাযোগ করুন।</div>
          <div class="contact-info">
            <span><i class="fa-solid fa-phone"></i> ০১৭০০-০০০০০০</span>
            <span><i class="fa-solid fa-envelope"></i> info@kachabazar.com</span>
            <span><i class="fa-solid fa-globe"></i> www.kachabazar.com</span>
          </div>
          <div class="copyright">© 2025 কাচাবাজার — সর্বস্বত্ব সংরক্ষিত</div>
        </div>
      </div>
    `;
  }

  // ============================================
  // ৭. Status Update
  // ============================================
  window.quickStatusUpdate = async (orderNumber, newStatus) => {
    try {
      const { error } = await supabaseClient
        .from('orders')
        .update({ 
          status: newStatus,
          ...(newStatus === 'delivered' ? { payment_status: 'paid' } : {})
        })
        .eq('order_number', orderNumber);

      if (error) throw error;
      
      showToast(`অর্ডার ${orderNumber} → ${STATUS_LABELS[newStatus] || newStatus} ✅`, 'success');
      loadOrders();

    } catch (err) {
      showToast('স্ট্যাটাস আপডেট ব্যর্থ: ' + err.message, 'error');
    }
  };

  // ============================================
  // ৮. Custom Confirm Modal & Delete
  // ============================================
  window.cancelOrder = (orderNumber, dbId) => {
    const existingModal = document.getElementById('cancelOrderModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div class="custom-confirm-modal" id="cancelOrderModal">
        <div class="custom-confirm-box">
          <div class="custom-confirm-icon">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h3>অর্ডার বাতিল করবেন?</h3>
          <p>আপনি কি সত্যিই <strong>#${orderNumber}</strong> অর্ডারটি বাতিল করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।</p>
          <div class="custom-confirm-actions">
            <button class="btn-no" onclick="document.getElementById('cancelOrderModal').remove()">না, থাকুক</button>
            <button class="btn-yes" onclick="confirmCancelOrder('${orderNumber}', ${dbId})">হ্যাঁ, বাতিল করুন</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => document.getElementById('cancelOrderModal').classList.add('show'), 10);
  };

  window.confirmCancelOrder = async (orderNumber, dbId) => {
    document.getElementById('cancelOrderModal').remove();
    
    try {
      const { error } = await supabaseClient
        .from('orders')
        .delete()
        .eq('id', dbId);

      if (error) throw error;
      
      showToast(`অর্ডার ${orderNumber} ডিলিট হয়েছে ✅`, 'success');
      loadOrders();

    } catch (err) {
      showToast('ডিলিট ব্যর্থ: ' + err.message, 'error');
    }
  };

  // ============================================
  // ৯. Init & Events
  // ============================================
  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    if (params.get('status')) activeStatus = params.get('status');

    document.querySelectorAll('.status-tab').forEach(tab => {
      if (tab.dataset.status === activeStatus) {
        tab.classList.add('btn-primary', 'active');
        tab.classList.remove('btn-outline');
      } else {
        tab.classList.remove('btn-primary', 'active');
        tab.classList.add('btn-outline');
      }

      tab.addEventListener('click', () => {
        document.querySelectorAll('.status-tab').forEach(t => {
          t.classList.remove('btn-primary', 'active');
          t.classList.add('btn-outline');
        });
        tab.classList.remove('btn-outline');
        tab.classList.add('btn-primary', 'active');
        activeStatus = tab.dataset.status;
        applyFilters();
      });
    });

    ['searchInput', 'filterPayment', 'sortBy'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', applyFilters);
        el.addEventListener('change', applyFilters);
      }
    });

    loadOrders();
  });

  // ম্যানুয়াল অর্ডার
  window.openManualOrderModal = () => {
    document.getElementById('manualModal').classList.add('show');
    document.getElementById('manualName').value = '';
    document.getElementById('manualPhone').value = '';
    document.getElementById('manualAddress').value = '';
    document.getElementById('manualPay').value = 'cod';
    document.getElementById('manualDelivery').value = 40;
    document.getElementById('manualItemsList').innerHTML = '';
    addManualItem();
  };

  window.closeModal = (id) => document.getElementById(id)?.classList.remove('show');

})();