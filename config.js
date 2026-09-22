// Supabase Configuration
// Replace these with your actual Supabase project URL and anon key.
const SUPABASE_URL = 'https://jiomqpiwyirwrzphtfkt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_o8QxoZHGoJUYyilrgl3n4Q_ahLcpYkL';

// Initialize Supabase Client
// NOTE: The Supabase library itself creates a global named "supabase".
// To avoid a "already declared" naming conflict, we grab that library
// reference first, then overwrite window.supabase with the actual client.
const _supabaseLib = window.supabase;
window.supabase = _supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
