// src/pages/api/transactions.js
// API endpoint for transactions

import { supabaseAdmin } from '../../lib/supabaseClient.server.js';

const isoDate = (d) => d.toISOString().slice(0,10);
const defaultRange = () => {
  const end = new Date();
  const start = new Date(); start.setDate(end.getDate() - 29);
  return { start: isoDate(start), end: isoDate(end) };
};

const sendCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const isValidDateISO = d => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(new Date(d).getTime());

export default async function handler(req, res) {
  sendCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    try {
      let { start, end, start_date, end_date } = req.query;
      start = start || start_date;
      end = end || end_date;
      if (!start || !end) ({ start, end } = defaultRange());

      // Try RPC first (defensive param names)
      const rpcParamVariants = [
        { p_start: start, p_end: end },
        { start: start, end: end },
        { start_date: start, end_date: end },
        { p_start_date: start, p_end_date: end }
      ];

      let rows = null;
      for (const params of rpcParamVariants) {
        const { data, error } = await supabaseAdmin.rpc('get_transactions', params);
        if (!error && data) { rows = data; break; }
      }

      if (!rows) {
        // fallback: direct query and return to client as JSON array of objects
        const { data, error } = await supabaseAdmin
          .from('daily_income_expense')
          .select('*')
          .gte('date', start)
          .lte('date', end)
          .order('date', { ascending: false });
        if (error) throw error;
        rows = data || [];
      }

      // Ensure we always return the correct structure
      const result = {
        rows: Array.isArray(rows) ? rows : []
      };
      return res.status(200).json(result);
    } catch (err) {
      console.error('transactions GET error:', err?.message || err);
      return res.status(500).json({ error: 'server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      console.log('[transactions] keys:', Object.keys(body));

      // Handle both snake_case and camelCase field names
      const item_name = body.item_name || body.itemName || body.item;
      const quantity = body.quantity;
      const price_per_quantity = body.price_per_quantity || body.pricePerUnit || body.pricePerQuantity;
      const item_type = body.item_type || body.itemType || body.entryType;
      const category = body.category;
      const date = body.date;

      const missing = [];
      if (!item_name || typeof item_name !== 'string') missing.push('item_name');
      if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) missing.push('quantity');
      if (price_per_quantity === undefined || isNaN(Number(price_per_quantity))) missing.push('price_per_quantity');
      const itemType = (item_type || '').toString().toLowerCase();
      if (!['income','expense'].includes(itemType)) missing.push('item_type');
      if (!category || typeof category !== 'string') missing.push('category');
      if (!isValidDateISO(date)) missing.push('date');

      if (missing.length) return res.status(400).json({ error: 'Missing or invalid fields', details: missing });

      const payload = {
        item_name: item_name,
        quantity: Number(quantity),
        price_per_quantity: Number(price_per_quantity),
        item_type: itemType,
        category: category,
        date: date,
        processed: false // Always set to false as required
      };

      const { data, error } = await supabaseAdmin.from('daily_income_expense').insert([payload]).select('*').limit(1);

      if (error) {
        console.error('[transactions] insert error', error);
        return res.status(500).json({ error: 'insert_failed', details: error.message });
      }

      return res.status(201).json({ success: true, row: data[0] });
    } catch (err) {
      console.error('[transactions] unexpected', err);
      return res.status(500).json({ error: err.message || 'unexpected' });
    }
  }

  res.setHeader('Allow', ['GET','POST','OPTIONS']);
  return res.status(405).end('Method not allowed');
}
