// ============================================
// middleware/requireAdmin.js
// সার্ভার API সিকিউরিটি ও রোল চেক
// ============================================
const { createClient } = require('@supabase/supabase-js');

// সার্ভার সাইড Supabase (Service Role Key)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function (req, res, next) {
  // ১. হেডার থেকে টোকেন নেওয়া
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // ২. টোকেন ভেরিফাই করে ইউজার বের করা
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid or expired token');

    // ৩. প্রোফাইল থেকে রোল চেক করা
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) throw new Error('Profile not found');

    // ৪. রোল ভ্যালিডেশন (admin, manager, editor ছাড়া কেউ ঢুকতে পারবে না)
    const allowedRoles = ['admin', 'manager', 'editor'];
    if (!allowedRoles.includes(profile.role)) {
      return res.status(403).json({ 
        error: 'Forbidden: Admin access required',
        yourRole: profile.role 
      });
    }

    // ৫. ইউজারের তথ্য req-এ সেভ করা (পরবর্তী রাউটে ব্যবহারের জন্য)
    req.user = user;
    req.userRole = profile.role;
    
    // যদি কোনো নির্দিষ্ট রাউটে শুধু admin দরকার হয়, তবে সেখানে req.userRole চেক করবেন
    next();

  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ error: err.message });
  }
};