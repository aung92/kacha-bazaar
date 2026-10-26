// ============================================
// ADMIN PRODUCTS — v3.0 (Supabase Connected)
// ============================================

(async () => {
  // ✅ লগইন চেক (আপনার admin-auth.js থেকে)
  if (typeof requireAdmin === 'function') requireAdmin();

  let allProducts = [];
  let filteredList = [];
  let currentPage = 1;
  const PAGE_SIZE = 10;

  const CAT_LABELS = {
    veg: 'সবজি', fruit: 'ফলমূল', fish: 'মাছ', meat: 'মাংস',
    dairy: 'দুধ ও ডিম', spice: 'মসলা', honey: 'মধু', rice: 'চাল ও ডাল', organic: 'অর্গানিক'
  };
  const DIST_LABELS = { rangamati: 'রাঙ্গামাটি', khagrachari: 'খাগড়াছড়ি', bandarban: 'বান্দরবান' };

  // ============================================
  // Load data from Supabase
  // ============================================
  async function load() {
    const tbody = document.getElementById('productsBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--gray-500)"><i class="fa-solid fa-spinner fa-spin"></i> লোড হচ্ছে...</td></tr>';

    try {
      // Supabase থেকে ডাটা আনা
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Supabase-এর ডাটাকে ফ্রন্টএন্ডের ফরম্যাটে রূপান্তর
      allProducts = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category_id,
        district: p.district_id,
        farmer: p.farmer_id,
        price: Number(p.price),
        oldPrice: Number(p.old_price),
        unit: p.unit || 'কেজি',
        stock: p.stock || 0,
        rating: p.rating || 4.5,
        img: p.img || '',
        active: p.active !== false,
        created_at: p.created_at
      }));

      populateFilters();
      applyFilters();

    } catch (err) {
      console.error('Error loading products:', err);
      if (tbody) tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--red-500)">পণ্য লোড ব্যর্থ: ${err.message}</td></tr>`;
    }
  }

  function populateFilters() {
    const catSel = document.getElementById('filterCategory');
    const distSel = document.getElementById('filterDistrict');
    
    if (catSel && catSel.options.length === 1) {
      Object.entries(CAT_LABELS).forEach(([id, name]) => {
        catSel.insertAdjacentHTML('beforeend', `<option value="${id}">${name}</option>`);
      });
    }
    if (distSel && distSel.options.length === 1) {
      Object.entries(DIST_LABELS).forEach(([id, name]) => {
        distSel.insertAdjacentHTML('beforeend', `<option value="${id}">${name}</option>`);
      });
    }
  }

  function populateProductFormOptions() {
    const category = document.getElementById('pfCategory');
    const district = document.getElementById('pfDistrict');
    const farmer = document.getElementById('pfFarmer');

    category.innerHTML = '<option value="">— ক্যাটাগরি নির্বাচন করুন —</option>' +
      Object.entries(CAT_LABELS).map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
    district.innerHTML = '<option value="">— জেলা নির্বাচন করুন —</option>' +
      Object.entries(DIST_LABELS).map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
    farmer.innerHTML = '<option value="">— নির্বাচন করুন —</option>';
  }

  window.openProductForm = () => {
    const form = document.getElementById('pfForm');
    form.reset();
    populateProductFormOptions();
    document.getElementById('pfTitle').textContent = '➕ নতুন পণ্য যোগ করুন';
    document.getElementById('pfSaveBtnText').textContent = 'সেভ করুন';
    document.getElementById('pfImagePreview').style.display = 'none';
    document.getElementById('productFormModal').classList.add('show');
  };

  window.closeProductForm = () => {
    document.getElementById('productFormModal').classList.remove('show');
  };

  function updateProductDiscount() {
    const price = Number(document.getElementById('pfPrice').value) || 0;
    const oldPrice = Number(document.getElementById('pfOldPrice').value) || 0;
    document.getElementById('pfDiscount').value =
      oldPrice > price && oldPrice > 0 ? Math.round((1 - price / oldPrice) * 100) : 0;
  }

  document.getElementById('pfPrice').addEventListener('input', updateProductDiscount);
  document.getElementById('pfOldPrice').addEventListener('input', updateProductDiscount);
  document.getElementById('pfImg').addEventListener('input', event => {
    const src = event.target.value.trim();
    const preview = document.getElementById('pfImagePreview');
    const image = document.getElementById('pfPreviewImg');
    if (!src) {
      preview.style.display = 'none';
      image.removeAttribute('src');
      return;
    }
    image.src = src;
    image.onload = () => { preview.style.display = 'block'; };
    image.onerror = () => { preview.style.display = 'none'; };
  });
  document.getElementById('pfImgFile').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      showToast('ছবির সাইজ ৫০০ KB এর কম হতে হবে', 'error');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('pfImg').value = reader.result;
      document.getElementById('pfImg').dispatchEvent(new Event('input'));
    };
    reader.onerror = () => showToast('ছবি পড়া যায়নি। আবার চেষ্টা করুন।', 'error');
    reader.readAsDataURL(file);
  });

  window.saveProduct = async event => {
    event.preventDefault();
    const form = document.getElementById('pfForm');
    if (!form.reportValidity()) return;

    const saveButton = form.querySelector('button[type="submit"]');
    const originalButtonText = saveButton.innerHTML;
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> সেভ হচ্ছে...';

    const payload = {
      name: document.getElementById('pfName').value.trim(),
      category_id: document.getElementById('pfCategory').value,
      district_id: document.getElementById('pfDistrict').value,
      farmer_id: document.getElementById('pfFarmer').value || null,
      unit: document.getElementById('pfUnit').value.trim(),
      price: Number(document.getElementById('pfPrice').value),
      old_price: Number(document.getElementById('pfOldPrice').value) || 0,
      stock: Number(document.getElementById('pfStock').value),
      rating: Number(document.getElementById('pfRating').value) || 4.5,
      img: document.getElementById('pfImg').value.trim(),
      active: document.getElementById('pfActive').checked
    };

    try {
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('সেশন শেষ হয়েছে। আবার লগইন করুন।');

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'পণ্য যোগ করা যায়নি');

      showToast('পণ্য সফলভাবে যোগ হয়েছে ✅', 'success');
      window.closeProductForm();
      await load();
    } catch (err) {
      console.error('Error creating product:', err);
      showToast('পণ্য যোগ ব্যর্থ: ' + err.message, 'error');
    } finally {
      saveButton.disabled = false;
      saveButton.innerHTML = originalButtonText;
    }
  };

  // ============================================
  // Filters & Render
  // ============================================
  window.applyFilters = () => {
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('filterCategory')?.value || '';
    const dist = document.getElementById('filterDistrict')?.value || '';
    const stock = document.getElementById('filterStock')?.value || '';
    const sort = document.getElementById('sortBy')?.value || 'newest';

    let list = allProducts.slice();
    
    if (search) list = list.filter(p => 
      p.name.toLowerCase().includes(search) || String(p.id).includes(search)
    );
    if (cat) list = list.filter(p => p.category === cat);
    if (dist) list = list.filter(p => p.district === dist);
    if (stock === 'in') list = list.filter(p => p.stock >= 10);
    if (stock === 'low') list = list.filter(p => p.stock > 0 && p.stock < 10);
    if (stock === 'out') list = list.filter(p => p.stock === 0);

    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'bn'));
    if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
    if (sort === 'stock') list.sort((a, b) => a.stock - b.stock);
    if (sort === 'newest') list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    filteredList = list;
    currentPage = 1;
    window.renderTable();
  };

  window.renderTable = () => {
    const body = document.getElementById('productsBody');
    if (!body) return;
    
    const total = filteredList.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PAGE_SIZE;
    const items = filteredList.slice(start, start + PAGE_SIZE);

    if (!items.length) {
      body.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--gray-500)">কোনো পণ্য নেই</td></tr>';
      window.renderPagination(1);
      return;
    }

    body.innerHTML = items.map(p => `
      <tr>
        <td><input type="checkbox" class="row-check" value="${p.id}" onchange="updateBulkBar()"></td>
        <td><img src="${p.img}" alt="${p.name}" style="width:40px;height:40px;border-radius:6px;object-fit:cover" onerror="this.src='https://via.placeholder.com/40'"></td>
        <td><strong>#${p.id}</strong></td>
        <td>${p.name}</td>
        <td>${CAT_LABELS[p.category] || p.category || '—'}</td>
        <td>${DIST_LABELS[p.district] || p.district || '—'}</td>
        <td><strong>${formatTk(p.price)}</strong></td>
        <td>${stockBadge(p.stock)}</td>
        <td>⭐ ${p.rating}</td>
        <td><span class="badge ${p.active ? 'badge-active' : 'badge-inactive'}">${p.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span></td>
        <td class="actions">
          <a href="product-form.html?id=${p.id}"><i class="fa-solid fa-pen"></i></a>
          <button class="del" onclick="askDelete(${p.id})"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
    window.renderPagination(totalPages);
  };

  window.renderPagination = (totalPages) => {
    const el = document.getElementById('pagination');
    if (!el) return;
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline'}" onclick="goPage(${i})" style="margin:0 3px">${i}</button>`;
    }
    el.innerHTML = html;
  };

  window.goPage = (n) => { currentPage = n; window.renderTable(); };

  // ============================================
  // Bulk Actions
  // ============================================
  window.toggleSelectAll = (cb) => {
    document.querySelectorAll('.row-check').forEach(c => c.checked = cb.checked);
    window.updateBulkBar();
  };

  window.updateBulkBar = () => {
    const count = document.querySelectorAll('.row-check:checked').length;
    const bar = document.getElementById('bulkActions');
    if (bar) bar.style.display = count > 0 ? 'block' : 'none';
    const el = document.getElementById('selectedCount');
    if (el) el.textContent = `${count}টি নির্বাচিত`;
  };

  window.getSelectedIds = () => [...document.querySelectorAll('.row-check:checked')].map(c => +c.value);

  // ============================================
  // Delete (Supabase)
  // ============================================
  let deleteTargetId = null;
  window.askDelete = (id) => {
    deleteTargetId = id;
    document.getElementById('deleteModal').classList.add('show');
  };
  window.closeModal = (id) => document.getElementById(id)?.classList.remove('show');

  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      if (!deleteTargetId) return;
      
      const originalText = confirmBtn.innerHTML;
      confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ডিলিট হচ্ছে...';
      confirmBtn.disabled = true;

      try {
        // ✅ Supabase থেকে পণ্য ডিলিট
        const { error } = await supabaseClient
          .from('products')
          .delete()
          .eq('id', deleteTargetId);

        if (error) throw error;

        showToast('পণ্য সফলভাবে ডিলিট হয়েছে ✅', 'success');
        closeModal('deleteModal');
        deleteTargetId = null;
        load(); // টেবিল রিফ্রেশ

      } catch (err) {
        console.error(err);
        showToast('ডিলিট ব্যর্থ: ' + err.message, 'error');
      } finally {
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
      }
    };
  }

  window.bulkDelete = async () => {
    const ids = getSelectedIds();
    if (!ids.length || !confirm(`${ids.length}টি পণ্য ডিলিট?`)) return;
    
    try {
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .in('id', ids);

      if (error) throw error;

      showToast(`${ids.length}টি ডিলিট ✅`, 'success');
      load();
    } catch (err) {
      showToast('ডিলিট ব্যর্থ: ' + err.message, 'error');
    }
  };

  window.bulkToggleActive = async (active) => {
    const ids = getSelectedIds();
    if (!ids.length) return;

    try {
      const { error } = await supabaseClient
        .from('products')
        .update({ active: active })
        .in('id', ids);

      if (error) throw error;

      showToast(`${ids.length}টি আপডেট ✅`, 'success');
      load();
    } catch (err) {
      showToast('আপডেট ব্যর্থ: ' + err.message, 'error');
    }
  };

  // ============================================
  // CSV Export
  // ============================================
  window.exportProductsCSV = () => {
    const rows = [['ID', 'Name', 'Category', 'District', 'Price', 'Stock', 'Rating']];
    filteredList.forEach(p => rows.push([p.id, p.name, CAT_LABELS[p.category] || p.category, DIST_LABELS[p.district] || p.district, p.price, p.stock, p.rating]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'products.csv';
    a.click();
    showToast('CSV ডাউনলোড ✅', 'success');
  };

  // ============================================
  // Init
  // ============================================
  ['searchInput', 'filterCategory', 'filterDistrict', 'filterStock', 'sortBy'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    }
  });

  // ডাটা লোড শুরু
  load();
})();