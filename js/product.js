document.addEventListener('DOMContentLoaded', async () => {
  const id = +new URLSearchParams(location.search).get('id');
  const box = document.getElementById('productContainer');

  if (!box) return;

  // লোডিং
  box.innerHTML = `<p style="padding:60px 0;text-align:center;color:var(--gray-500)">
    <i class="fa-solid fa-spinner fa-spin"></i> পণ্য লোড হচ্ছে...
  </p>`;

  // API থেকে পণ্য লোড
  let allProducts = [];
  try {
    allProducts = await loadProducts();
  } catch (e) {
    allProducts = PRODUCTS;
  }

  const p = allProducts.find(x => Number(x.id) === id);

  if (!p) {
    box.innerHTML = `
      <div style="text-align:center;padding:80px 20px">
        <h2>পণ্য পাওয়া যায়নি 😔</h2>
        <p style="color:var(--gray-500);margin:10px 0 20px">এই পণ্যটি সরানো হয়েছে বা নেই।</p>
        <a href="shop.html" class="btn btn-primary">শপে ফিরুন</a>
      </div>`;
    return;
  }

  document.title = p.name + ' — কাচাবাজার';

  const dist = getDistrict(p.district);
  const farmer = getFarmer(p.farmer);
  const oldPrice = p.oldPrice || p.old_price;

  box.innerHTML = `
    <div class="product-view">
      <div class="product-view-img">
        <img src="${p.img}" alt="${p.name}">
      </div>
      <div class="product-view-info">
        ${dist ? `<span class="district-tag" style="background:${dist.color}20;color:${dist.color};margin-bottom:10px">
          ${dist.emoji} ${dist.name}
        </span>` : ''}
        <h1>${p.name}</h1>
        <p class="unit">প্রতি ${p.unit} · রেটিং <i class="fa-solid fa-star" style="color:var(--yellow-400)"></i> ${p.rating}</p>
        <div>
          <span class="big-price">${formatTk(p.price)}</span>
          ${oldPrice ? `<span class="big-old">${formatTk(oldPrice)}</span>` : ''}
          ${p.discount ? `<span style="background:var(--orange-500);color:#fff;padding:4px 10px;border-radius:6px;font-size:12px;margin-left:8px">-${p.discount}%</span>` : ''}
        </div>

        <div class="origin-box">
          <div class="origin-title">🌄 কোথা থেকে এসেছে</div>
          <div id="originInfo"></div>
        </div>

        <div class="qty-row">
          <div class="qty-box">
            <button onclick="changeQty(-1)">−</button>
            <input type="number" id="qty" value="1" min="1">
            <button onclick="changeQty(1)">+</button>
          </div>
          <button class="btn btn-primary" onclick="addNow()"><i class="fa-solid fa-cart-shopping"></i> কার্টে যোগ করুন</button>
          <button class="btn btn-outline" onclick="buyNow()">এখনই কিনুন</button>
        </div>

        <p class="desc">
          ${dist ? dist.name + ' জেলার' : 'পাহাড়ি'} কৃষকের নিজ হাতে চাষ করা ${p.name.toLowerCase()}। কোনো কেমিক্যাল বা প্রিজারভেটিভ ছাড়া, সরাসরি পাহাড় থেকে সংগ্রহ করা।
        </p>

        <div class="meta">
          <div>✅ স্টকে আছে: ${p.stock} ${p.unit}</div>
          <div>🚚 ঢাকায় ২-৪ দিনে ডেলিভারি</div>
          <div>💵 ক্যাশ অন ডেলিভারি সুবিধা</div>
        </div>
      </div>
    </div>
  `;

  // Origin info
  const originEl = document.getElementById('originInfo');
  if (originEl && dist) {
    originEl.innerHTML = `
      <strong>${dist.emoji} ${dist.name}</strong> জেলা${
        farmer ? ` · কৃষক: <strong>${farmer.name}</strong> (${farmer.village}, ${farmer.years} বছরের অভিজ্ঞতা)` : ''
      }
    `;
  }

  // Related products
  const related = allProducts
    .filter(x => x.category === p.category && Number(x.id) !== Number(p.id))
    .slice(0, 4);

  const relatedGrid = document.getElementById('relatedGrid');
  if (relatedGrid) {
    relatedGrid.innerHTML = related.length
      ? related.map(productCard).join('')
      : '<p style="grid-column:1/-1;color:var(--gray-500)">আর কোনো পণ্য নেই।</p>';
  }
});

// HELPERS
function changeQty(delta) {
  const input = document.getElementById('qty');
  let v = +input.value + delta;
  if (v < 1) v = 1;
  input.value = v;
}

function addNow() {
  const id = +new URLSearchParams(location.search).get('id');
  const qty = +document.getElementById('qty').value;
  Cart.add(id, qty);
  showToast('কার্টে যোগ হয়েছে ✅', 'success');
}

function buyNow() {
  addNow();
  location.href = 'cart.html';
}