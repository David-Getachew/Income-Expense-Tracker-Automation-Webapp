// src/pages/api/expenses-by-category.js
// API endpoint for expenses by category from daily_summaries

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
    let { start, end } = req.query;
    if (!start || !end) ({ start, end } = defaultRange());

    // Try RPC with different parameter variants
    const rpcParamVariants = [
      { p_start: start, p_end: end },
      { start: start, end: end },
      { start_date: start, end_date: end },
      { p_start_date: start, p_end_date: end }
    ];

    let data = null;
    let error = null;
    
    for (const params of rpcParamVariants) {
      const result = await supabaseAdmin.rpc('get_expenses_by_category', params);
      if (!result.error && result.data) {
        data = result.data;
        break;
      }
    }

    if (!data) {
      // Fallback: fetch daily_summaries and compute aggregated estimates
      const { data: rows, error: qerr } = await supabaseAdmin
        .from('daily_summaries')
        .select('total_expense, expense_percent_by_category')
        .gte('date', start)
        .lte('date', end);

      if (qerr) throw qerr;

      const agg = new Map();
      let grand_total = 0;
      (rows || []).forEach(r => {
        const te = Number(r.total_expense || 0);
        const pctObj = r.expense_percent_by_category || {};
        grand_total += te;
        Object.entries(pctObj || {}).forEach(([cat, val]) => {
          const pct = Number(String(val).replace(/[^0-9.]/g, '')) || 0;
          const amount = (pct / 100) * te;
          agg.set(cat, (agg.get(cat) || 0) + amount);
        });
      });

      const out = Array.from(agg.entries()).map(([category, total]) => ({
        category,
        total: Number(total.toFixed(2)),
        percent: grand_total === 0 ? 0 : Number(((total / grand_total) * 100).toFixed(2))
      })).sort((a,b) => b.total - a.total);

      data = out;
    }

    // Ensure we always return an array
    const result = Array.isArray(data) ? data : [];
    return res.status(200).json(result);
  } catch (err) {
    console.error('expenses-by-category error:', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
}