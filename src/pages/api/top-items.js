// src/pages/api/top-items.js
// API endpoint for top items by revenue or quantity

import { supabaseAdmin } from '../../lib/supabaseClient.server.js';
import { validateOwner } from '../../lib/auth.js';

// GET /api/top-items
export async function handleGetTopItems(req, res) {
  try {
    // Validate authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const isValidOwner = await validateOwner(token);
    
    if (!isValidOwner) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Unauthorized access'
      });
    }

    const { start, end, by = 'revenue', limit = 5 } = req.query;

    // Validate 'by' parameter
    if (by !== 'revenue' && by !== 'quantity') {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Invalid "by" parameter. Must be "revenue" or "quantity"'
      });
    }

    // Validate limit parameter
    const limitNum = Math.min(parseInt(limit) || 5, 20); // Max 20 items

    // Build the query
    let query = supabaseAdmin
      .from('daily_income_expense')
      .select('item_name, price_per_quantity, quantity, item_type')
      .eq('item_type', 'Income');

    // Apply date filters
    if (start && end) {
      query = query.gte('date', start).lte('date', end);
    } else if (start) {
      query = query.gte('date', start);
    } else if (end) {
      query = query.lte('date', end);
    }

    // Execute query to get all data
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching top items:', error);
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Failed to fetch top items'
      });
    }

    // Process data in memory to calculate top items
    const itemMap = new Map();

    // Calculate revenue or quantity for each item
    data.forEach(row => {
      const itemName = row['item_name'];
      const pricePerUnit = parseFloat(row['price_per_quantity']) || 0;
      const quantity = parseInt(row['quantity']) || 0;
      const revenue = pricePerUnit * quantity;

      if (itemMap.has(itemName)) {
        const existing = itemMap.get(itemName);
        existing.revenue += revenue;
        existing.quantity += quantity;
      } else {
        itemMap.set(itemName, {
          itemName,
          revenue,
          quantity
        });
      }
    });

    // Convert map to array and sort
    let result = Array.from(itemMap.values());
    
    if (by === 'revenue') {
      result.sort((a, b) => b.revenue - a.revenue);
    } else {
      result.sort((a, b) => b.quantity - a.quantity);
    }

    // Limit results
    result = result.slice(0, limitNum);

    return res.status(200).json({
      success: true,
      data: result,
      error: null
    });
  } catch (err) {
    console.error('Error in handleGetTopItems:', err);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Internal server error'
    });
  }
}

// Main handler function for Express
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      data: null,
      error: `Method ${req.method} Not Allowed`
    });
  }

  return handleGetTopItems(req, res);
}