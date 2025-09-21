// src/pages/api/transactions.js
// API endpoint for transactions

import { supabaseAdmin } from '../../lib/supabaseServer.js';

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
      const b = req.body || {};
      // Handle both snake_case and camelCase field names
      // Handle both snake_case and camelCase field names
      const item_name = b.item_name || b.itemName || b.item;
      const quantity = Number.isFinite(Number(b.quantity)) ? parseInt(b.quantity, 10) : NaN;
      const price_per_quantity = Number.isFinite(Number(b.price_per_quantity ?? b.pricePerUnit)) ? Number(b.price_per_quantity ?? b.pricePerUnit) : NaN;
      const item_type = (b.item_type || b.itemType || '').toString().toLowerCase();
      const category = b.category || b.customCategory;
      const date = b.date;
      // Always set processed to false as requested
      const processed = false;

      const missing = [];
      const invalid = [];
      if (!item_name) missing.push('item_name');
      if (isNaN(quantity)) invalid.push('quantity');
      if (isNaN(price_per_quantity)) invalid.push('price_per_quantity');
      if (!item_type || !['income','expense'].includes(item_type)) invalid.push('item_type');
      if (!category) missing.push('category');
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) invalid.push('date');

      // Log the request body for debugging
      console.log('Transaction POST request body:', JSON.stringify(b, null, 2));
      
      if (missing.length || invalid.length) {
        console.warn('Bad transaction request:', { missing, invalid });
        return res.status(400).json({ 
          error: 'Missing or invalid fields', 
          details: [...missing, ...invalid] 
        });
      }

      // Try RPC insert_transaction first
      let insertResult = null;
      const rpcParams = {
        p_item_name: item_name,
        p_quantity: quantity,
        p_price_per_quantity: price_per_quantity,
        p_item_type: item_type,
        p_category: category,
        p_date: date,
        p_processed: processed
      };

      try {
        const { data, error } = await supabaseAdmin.rpc('insert_transaction', rpcParams);
        if (!error && data) insertResult = data;
      } catch (e) {
        // continue to fallback
      }

      if (!insertResult) {
        const { data, error } = await supabaseAdmin
          .from('daily_income_expense')
          .insert([{
            item_name, quantity, price_per_quantity, item_type, category, date, processed
          }])
          .select()
          .single();
        if (error) throw error;
        insertResult = data;
      }

      console.info(`Inserted transaction: ${item_name} | ${date} | ${item_type} | qty=${quantity} | price=${price_per_quantity}`);
      // Return the inserted data as required
      return res.status(201).json(insertResult || { 
        item_name, 
        quantity, 
        price_per_quantity, 
        item_type, 
        category, 
        date 
      });
    } catch (err) {
      console.error('transactions POST error:', err?.message || err);
      return res.status(500).json({ error: 'server error' });
    }
  }

  res.setHeader('Allow', ['GET','POST','OPTIONS']);
  return res.status(405).end('Method not allowed');
}