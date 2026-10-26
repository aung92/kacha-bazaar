// ============================================
// SUPABASE CLIENT — Admin Portal
// ============================================

// ✅ আপনার প্রজেক্টের আসল URL এবং Key
const SUPABASE_URL = 'https://ddjtvleuntyjuasawoyj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_37VvUbK_5T79ddNbAgzykg_gDUVpKKV';

// ✅ Supabase ক্লায়েন্ট তৈরি
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ গ্লোবাল স্কোপে অ্যাসাইন করা (যাতে admin-orders.js বা অন্য ফাইল থেকে অ্যাক্সেস করা যায়)
window.supabaseClient = supabaseClient;

// ============================================
// Helper functions (যদি কখনো API রুট ব্যবহার করতে চান)
// ============================================
async function apiGet(path) {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(path, body) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const token = session?.access_token;
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ============================================
// Console Log (ডিবাগিংয়ের জন্য)
// ============================================
console.log('✅ Supabase Client Initialized:', SUPABASE_URL);