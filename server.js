require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// মিডলওয়্যার
// ============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================
// Supabase Admin Client (Service Role Key)
// ============================================
// ⚠️ নিশ্চিত করুন .env ফাইলে এই দুটি ভ্যারিয়েবল আছে
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: .env ফাইলে SUPABASE_URL বা SUPABASE_SERVICE_ROLE_KEY নেই!");
  process.exit(1);
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const requireAdmin = require('./middleware/requireAdmin');

// ============================================
// ✅ ১. Products API (পণ্য লোড করার জন্য)
// ============================================
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Products load error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ✅ ২. Orders API (অর্ডার তৈরি ও লোড করার জন্য)
// ============================================
// কাস্টমারের নিজের অর্ডার লোড করা
app.get('/api/orders/my', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'লগইন করা নেই' });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'অবৈধ টোকেন' });

    const { data: orders, error: dbError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    const formattedOrders = orders.map(o => ({
      id: o.order_number || String(o.id),
      customer: o.customer_name,
      status: o.status,
      total: Number(o.total),
      created_at: o.created_at,
      items_detail: (o.order_items || []).map(it => ({
        name: it.name,
        price: Number(it.price),
        qty: it.qty,
        unit: it.unit
      }))
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error('Order load error:', err);
    res.status(500).json({ error: err.message });
  }
});

// নতুন অর্ডার তৈরি করা (চেকআউট থেকে)
app.post('/api/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'অর্ডার করতে লগইন করুন' });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: 'অবৈধ টোকেন' });

    const { id, customer, phone, address, area, slot, items, subtotal, delivery, total, payment } = req.body;

    // ১. অর্ডার সেভ করা
    const { data: orderData, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: id,
        customer_id: user.id,
        customer_name: customer,
        customer_phone: phone,
        customer_address: address,
        area: area,
        delivery_slot: slot,
        subtotal: subtotal,
        delivery: delivery,
        total: total,
        payment_method: payment,
        payment_status: 'unpaid',
        status: 'pending'
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // ২. অর্ডারের পণ্যগুলো সেভ করা
    if (items && items.length > 0) {
      const itemsWithOrderId = items.map(it => ({
        order_id: orderData.id,
        name: it.name,
        price: it.price,
        qty: it.qty,
        unit: it.unit,
        subtotal: it.price * it.qty
      }));

      const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(itemsWithOrderId);
      if (itemsErr) throw itemsErr;
    }

    res.json({ success: true, message: 'অর্ডার সফল হয়েছে', orderId: orderData.id });
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ✅ ৩. aamarPay Payment Routes (পেমেন্ট গেটওয়ে)
// ============================================
app.post('/api/payment/initiate', async (req, res) => {
  try {
    const { orderId, amount, customerName, customerPhone, customerEmail } = req.body;

    const paymentData = {
      store_id: 'aamarpaytest',
      signature_key: 'dbb74894e82415a2f7ff0ec3a97e4183',
      tran_id: orderId,
      amount: amount,
      currency: 'BDT',
      desc: 'Kachabazar Order Payment',
      cus_name: customerName,
      cus_email: customerEmail || 'test@test.com',
      cus_phone: customerPhone,
      success_url: 'http://localhost:3000/api/payment/success',
      fail_url: 'http://localhost:3000/api/payment/fail',
      cancel_url: 'http://localhost:3000/api/payment/fail',
      type: 'json'
    };

    const response = await axios.post('https://sandbox.aamarpay.com/index.php', paymentData);

    if (response.data && response.data.payment_url) {
      res.json({ success: true, payment_url: response.data.payment_url });
    } else {
      res.status(400).json({ success: false, message: 'পেমেন্ট URL পাওয়া যায়নি' });
    }
  } catch (error) {
    console.error('aamarPay Error:', error.message);
    res.status(500).json({ success: false, message: 'সার্ভার এরর: ' + error.message });
  }
});

app.post('/api/payment/success', (req, res) => {
  // পেমেন্ট সফল হলে এখানে অর্ডারকে 'paid' করে দিতে হবে (ঐচ্ছিক)
  res.redirect('/account.html?payment=success');
});

app.post('/api/payment/fail', (req, res) => {
  res.redirect('/checkout.html?payment=failed');
});

// ============================================
// ✅ ৪. Admin APIs (স্টাফ তৈরি এবং পাসওয়ার্ড রিসেট)
// ============================================
app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'সব তথ্য প্রদান করুন' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name, phone }
    });

    if (authError) throw authError;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: name,
        phone: phone,
        email: email,
        role: role
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    res.json({ success: true, message: 'ইউজার সফলভাবে তৈরি হয়েছে' });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/change-user-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'ইউজার আইডি এবং নতুন পাসওয়ার্ড দিন' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) throw error;

    res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  const {
    name,
    category_id: categoryId,
    district_id: districtId,
    farmer_id: farmerId,
    unit,
    price,
    old_price: oldPrice,
    stock,
    rating,
    img,
    active
  } = req.body || {};

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof categoryId !== 'string' || !categoryId ||
    typeof districtId !== 'string' || !districtId ||
    typeof unit !== 'string' || !unit.trim() ||
    !Number.isFinite(price) || price < 0 ||
    !Number.isFinite(oldPrice) || oldPrice < 0 ||
    !Number.isInteger(stock) || stock < 0 ||
    !Number.isFinite(rating) || rating < 0 || rating > 5 ||
    (farmerId !== null && typeof farmerId !== 'string') ||
    typeof img !== 'string' ||
    typeof active !== 'boolean'
  ) {
    return res.status(400).json({ error: 'পণ্যের তথ্য সঠিকভাবে পূরণ করুন' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: name.trim(),
        category_id: categoryId,
        district_id: districtId,
        farmer_id: farmerId,
        unit: unit.trim(),
        price,
        old_price: oldPrice,
        stock,
        rating,
        img,
        active
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// স্ট্যাটিক ফাইল সার্ভ করা
// ============================================
// Project-root PWA assets must be served from the origin root so the
// service worker can control the customer site.
app.get('/sw.js', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'sw.js'));
});

app.get('/offline.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'offline.html'));
});

// গ্রাহক সাইট — public/ ফোল্ডার
app.use(express.static(path.join(__dirname, 'public')));

// অ্যাডমিন প্যানেল — admin/ ফোল্ডার
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ============================================
// 404 Fallback
// ============================================
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  const notFoundPath = path.join(__dirname, 'public', '404.html');
  if (fs.existsSync(notFoundPath)) {
    return res.status(404).sendFile(notFoundPath);
  }
  res.status(404).send('404 — পেজ পাওয়া যায়নি');
});

// ============================================
// গ্লোবাল এরর হ্যান্ডলার
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// সার্ভার স্টার্ট
// ============================================
app.listen(PORT, () => {
  console.log(`✅ সার্ভার চলছে: http://localhost:${PORT}`);
  console.log(`🛒 গ্রাহক সাইট: http://localhost:${PORT}/`);
  console.log(`🔐 অ্যাডমিন প্যানেল: http://localhost:${PORT}/admin/`);
});