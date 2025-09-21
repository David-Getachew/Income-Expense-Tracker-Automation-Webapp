// src/pages/api/kpis.js
// API endpoint for KPI data from daily_summaries

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
    let { start, end, start_date, end_date } = req.query;
    start = start || start_date;
    end = end || end_date;
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
      const result = await supabaseAdmin.rpc('get_kpis', params);
      if (!result.error && result.data) {
        data = result.data;
        break;
      }
    }

    if (!data) {
      // fallback: aggregate from daily_summaries
      const { data: rows, error: qerr } = await supabaseAdmin
        .from('daily_summaries')
        .select('total_income,total_expense,net_profit,num_income,num_expense')
        .gte('date', start)
        .lte('date', end);

      if (qerr) throw qerr;

      const totals = (rows || []).reduce((acc, r) => {
        acc.total_income += Number(r.total_income || 0);
        acc.total_expense += Number(r.total_expense || 0);
        acc.net_profit += Number(r.net_profit || 0);
        acc.num_income += Number(r.num_income || 0);
        acc.num_expense += Number(r.num_expense || 0);
        return acc;
      }, { total_income: 0, total_expense: 0, net_profit: 0, num_income: 0, num_expense: 0 });

      data = totals;
    }

    // Ensure we always return an object with the expected structure
    const result = {
      total_income: (data && data.total_income) ? data.total_income : 0,
      total_expense: (data && data.total_expense) ? data.total_expense : 0,
      net_income: (data && data.net_profit) ? data.net_profit : 0
    };
    
    return res.status(200).json(result);
  } catch (err) {
    console.error('kpis error:', err?.message || err);
    return res.status(500).json({ error: 'server error' });
  }
}