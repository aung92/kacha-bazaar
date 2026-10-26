const SUPABASE_URL = 'https://ddjtvleuntyjuasawoyj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_37VvUbK_5T79ddNbAgzykg_gDUVpKKV';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

async function apiPatch(path, body) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const token = session?.access_token;
  const res = await fetch(`/api${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}