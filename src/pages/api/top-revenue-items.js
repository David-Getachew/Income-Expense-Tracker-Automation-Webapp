// src/pages/api/top-revenue-items.js
// API endpoint for top items by revenue from daily_summaries

import { supabaseAdmin } from '../../lib/supabaseServer.js';

const defaultRange = () => {
  const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 29);
  return { start: start.toISOString().slice(0,10), end: end.toISOString().slice(0,10) };
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).end();

  try {
    let { start, end, limit = '5' } = req.query;
    if (!start || !end) ({ start, end } = defaultRange());
    const p_limit = parseInt(limit, 10) || 5;

    // Try RPC with different parameter variants
    const rpcParamVariants = [
      { p_start: start, p_end: end, p_limit: p_limit },
      { start: start, end: end, limit: p_limit },
      { start_date: start, end_date: end, limit: p_limit },
      { p_start_date: start, p_end_date: end, p_limit: p_limit }
    ];

    let data = null;
    let error = null;
    
    for (const params of rpcParamVariants) {
      const result = await supabaseAdmin.rpc('get_top_revenue_items', params);
      if (!result.error && result.data) {
        data = result.data;
        break;
      }
    }

    if (!data) {
      // Fallback: fetch rows and aggregate client-side
      const { data: rows, error: qerr } = await supabaseAdmin
        .from('daily_summaries')
        .select('top_income_items')
        .gte('date', start)
        .lte('date', end);

      if (qerr) throw qerr;

      const agg = new Map();
      (rows || []).forEach(r => {
        const arr = r.top_income_items || [];
        if (!Array.isArray(arr)) return;
        arr.forEach(it => {
          const name = it.item || it.item_name || it.name || '(unknown)';
          const raw = String(it.revenue ?? it.amount ?? 0);
          const numeric = Number((raw || '').toString().replace(/[^0-9.]/g, '') || 0);
          agg.set(name, (agg.get(name) || 0) + numeric);
        });
      });

      const out = Array.from(agg.entries())
        .map(([item_name, total_revenue]) => ({ item: item_name, revenue: total_revenue }))
        .sort((a,b) => b.revenue - a.revenue)
        .slice(0, p_limit);

      data = out;
    }

    // Ensure we always return an array
    const result = Array.isArray(data) ? data : [];
    return res.status(200).json(result);
  } catch (err) {
    console.error('top-revenue-items error:', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
}