// Supabase Configuration
// Replace these with your actual Supabase project URL and anon key.
const SUPABASE_URL = 'https://jiomqpiwyirwrzphtfkt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_o8QxoZHGoJUYyilrgl3n4Q_ahLcpYkL';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
