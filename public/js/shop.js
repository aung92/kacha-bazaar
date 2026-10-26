// ============================================
// কাচাবাজার — shop.js (v2.0)
// Shop page filter, sort, search
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // ============================================
  // URL PARAMS
  // ============================================
  const params = new URLSearchParams(location.search);
  let activeCat = params.get('cat') || 'all';
  let activeDistrict = params.get('district') || 'all';
  let query = (params.get('q') || '').toLowerCase();
  let maxPrice = 2000;
  let sortBy = 'default';
  let allProducts = [];

  // ============================================
  // SAFE GETTERS
  // ============================================
  const $ = (id) => document.getElementById(id);
  const grid = $('shopGrid');
  const titleEl = $('shopTitle');
  const subEl = $('shopSub');
  const countEl = $('resultCount');

  if (!grid) {
    console.error('❌ shopGrid element পাওয়া যায়নি!');
    return;
  }

  if (typeof productCard === 'undefined') {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:40px;color:red">
      ❌ utils.js লোড হয়নি!</p>`;
    return;
  }

  // ============================================
  // LOAD PRODUCTS (API → fallback demo)
  // ============================================
  try {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--gray-500);padding:40px">
      <i class="fa-solid fa-spinner fa-spin"></i> পণ্য লোড হচ্ছে...</p>`;
    allProducts = await loadProducts();
    if (!Array.isArray(allProducts)) allProducts = [];
  } catch (err) {
    console.error('Products load failed:', err);
    allProducts = (typeof PRODUCTS !== 'undefined') ? PRODUCTS : [];
  }

  // ============================================
  // CATEGORY FILTER
  // ============================================
  const filterCats = $('filterCats');
  if (filterCats && typeof CATEGORIES !== 'undefined') {
    filterCats.innerHTML = `
      <label><input type="radio" name="cat" value="all" ${activeCat === 'all' ? 'checked' : ''}> সব</label>
    ` + CATEGORIES.map(c => `
      <label><input type="radio" name="cat" value="${c.id}" ${activeCat === c.id ? 'checked' : ''}> ${c.emoji} ${c.name}</label>
    `).join('');

    filterCats.addEventListener('change', e => {
      if (e.target.name === 'cat') {
        activeCat = e.target.value;
        render();
      }
    });
  }

  // ============================================
  // DISTRICT FILTER
  // ============================================
  const filterDistricts = $('filterDistricts');
  if (filterDistricts && typeof DISTRICTS !== 'undefined') {
    filterDistricts.innerHTML = `
      <label><input type="radio" name="dist" value="all" ${activeDistrict === 'all' ? 'checked' : ''}> সব জেলা</label>
    ` + DISTRICTS.map(d => `
      <label><input type="radio" name="dist" value="${d.id}" ${activeDistrict === d.id ? 'checked' : ''}> ${d.emoji} ${d.name}</label>
    `).join('');

    filterDistricts.addEventListener('change', e => {
      if (e.target.name === 'dist') {
        activeDistrict = e.target.value;
        render();
      }
    });
  }

  // ============================================
  // PRICE RANGE
  // ============================================
  const priceRange = $('priceRange');
  const priceVal = $('priceVal');
  if (priceRange && priceVal) {
    priceRange.addEventListener('input', () => {
      maxPrice = +priceRange.value;
      priceVal.textContent = maxPrice;
      render();
    });
  }

  // ============================================
  // SORT
  // ============================================
  const sortSelect = $('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      sortBy = e.target.value;
      render();
    });
  }

  // ============================================
  // RENDER
  // ============================================
  function render() {
    let list = allProducts.filter(p => {
      if (activeCat !== 'all' && p.category !== activeCat) return false;
      if (activeDistrict !== 'all' && p.district !== activeDistrict) return false;
      if (query && !String(p.name || '').toLowerCase().includes(query)) return false;
      if (Number(p.price) > maxPrice) return false;
      return true;
    });

    if (sortBy === 'low') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'high') list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === 'rating') list.sort((a, b) => Number(b.rating) - Number(a.rating));

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-magnifying-glass"></i>
          <h3>কোনো পণ্য পাওয়া যায়নি</h3>
          <p>ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          <a href="shop.html" class="btn btn-primary">সব পণ্য দেখুন</a>
        </div>`;
    } else {
      grid.innerHTML = list.map(productCard).join('');
    }

    if (countEl) countEl.textContent = `${list.length}টি পণ্য`;

    let titleParts = [];
    if (activeDistrict !== 'all' && typeof getDistrict === 'function') {
      const d = getDistrict(activeDistrict);
      if (d) titleParts.push(d.name);
    }
    if (activeCat !== 'all' && typeof CATEGORIES !== 'undefined') {
      const c = CATEGORIES.find(x => x.id === activeCat);
      if (c) titleParts.push(c.name);
    }
    if (titleEl) titleEl.textContent = titleParts.length ? titleParts.join(' · ') : 'সব পণ্য';
    if (subEl) subEl.textContent = `${list.length}টি পণ্য পাওয়া গেছে`;

    // সার্চ ইনপুট সিঙ্ক
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput && query) searchInput.value = query;
    const mobSearchInput = document.querySelector('.mobile-search-bar input');
    if (mobSearchInput && query) mobSearchInput.value = query;
  }

  // ============================================
  // INITIAL RENDER
  // ============================================
  render();
});