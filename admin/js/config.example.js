// ============================================
// CONFIG EXAMPLE — এই ফাইল Git-এ commit হবে
// ব্যবহার: copy করে config.js বানান, তারপর নিজের key দিন
// ============================================

window.APP_CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY_HERE',
  ENV: 'development' // 'development' | 'production'
};

/*
📖 নির্দেশনা:

1. Supabase Dashboard → Settings → API খুলুন
2. Project URL কপি করুন → SUPABASE_URL-এ বসান
3. anon public key কপি করুন → SUPABASE_ANON_KEY-এ বসান
4. এই ফাইলটি copy করে `js/config.js` নামে save করুন
5. config.js-এ 실제 value বসান

⚠️ config.js কখনো GitHub-এ commit করবেন না!
   (.gitignore-এ already যোগ করা আছে)
*/