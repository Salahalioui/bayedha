// api/keep-alive.js - Vercel Serverless Function to keep Supabase active
export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wqtwsqyhzplrmmnvoxql.supabase.co';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_NqYevCvWwvgWP-3ikvk6Pw_SKH8QBUU';

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/spots?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const status = response.status;
    const ok = response.ok;

    return res.status(200).json({
      status: 'ok',
      message: 'Supabase Keep-Alive Ping Executed',
      supabase_status: status,
      is_active: ok,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
