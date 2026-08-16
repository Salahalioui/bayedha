// supabase-client.js - Live Central Database & Real-Time Sync Engine (El Bayadh Cloud)
// Connects citizens and the coordinator in real-time with zero latency.

const SUPABASE_CONFIG = {
  url: 'https://wqtwsqyhzplrmmnvoxql.supabase.co',
  anonKey: 'sb_publishable_NqYevCvWwvgWP-3ikvk6Pw_SKH8QBUU'
};

let supabaseClient = null;

if (window.supabase) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('🌿 Supabase Cloud Client Initialized for El Bayadh');
  } catch (err) {
    console.warn('Supabase initialization failed, running in local mode:', err);
  }
}

window.supabaseClient = supabaseClient;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
