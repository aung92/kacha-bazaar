// ============================================
// ADMIN AUTH — Supabase Auth
// ============================================

const AUTH_MODE = 'supabase';

async function isAdminLoggedIn() {
  return !!getAdmin();
}

function getAdmin() {
  try {
    const raw = localStorage.getItem('kc_admin_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // basic validation
    if (!parsed || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function requireAdmin() {
  const a = getAdmin();
  if (!a || (AUTH_MODE === 'supabase' && (!a.token || a.id === 'demo'))) {
    localStorage.removeItem('kc_admin_user');
    location.href = 'index.html';
    return null;
  }
  return a;
}

function setAdminSession(user) {
  localStorage.setItem('kc_admin_user', JSON.stringify({
    id: user.id || 'demo',
    name: user.name || 'Admin',
    email: user.email,
    role: user.role || 'admin',
    token: user.token || null,
    loginAt: Date.now()
  }));
}

// ============================================
// SUPABASE LOGIN
// ============================================
async function adminLogin(email, password) {
  // Supabase mode
  try {
    const client = window.supabaseClient;
    if (!client) throw new Error('Supabase লোড হয়নি');
    const { data: authData, error: authError } = await client.auth.signInWithPassword({ email, password });
    if (authError) throw authError;

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role, name')
      .eq('id', authData.user.id)
      .single();
    if (profileError) throw new Error('প্রোফাইল পাওয়া যায়নি');

    const allowedRoles = ['admin', 'manager', 'editor', 'staff'];
    if (!allowedRoles.includes(profile.role)) {
      await client.auth.signOut();
      throw new Error('এই প্যানেলে ঢোকার অনুমতি নেই');
    }

    setAdminSession({
      id: authData.user.id,
      email,
      name: profile.name || 'Admin',
      role: profile.role,
      token: authData.session.access_token
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

async function adminLogout() {
  if (AUTH_MODE === 'supabase' && window.supabaseClient) {
    try {
      await window.supabaseClient.auth.signOut();
    } catch (e) { /* ignore */ }
  }
  localStorage.removeItem('kc_admin_user');
  location.href = 'index.html';
}

// রোল চেক helper
function hasRole(...roles) {
  const a = getAdmin();
  if (!a) return false;
  return roles.includes(a.role);
}

// পারমিশন চেক (roles.html এর সাথে sync)
function hasPermission(perm) {
  const a = getAdmin();
  if (!a) return false;
  if (a.role === 'admin') return true; // super admin
  try {
    const roles = JSON.parse(localStorage.getItem('kc_admin_roles') || '[]');
    const role = roles.find(r => r.name.toLowerCase() === a.role.toLowerCase());
    return role ? (role.perms || []).includes(perm) : true;
  } catch { return true; }
}