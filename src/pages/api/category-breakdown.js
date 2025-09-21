// src/pages/api/category-breakdown.js
// API endpoint for expense breakdown by category

import { supabaseAdmin } from '../../lib/supabaseClient.server.js';
import { validateOwner } from '../../lib/auth.js';

// GET /api/category-breakdown
export async function handleGetCategoryBreakdown(req, res) {
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

    const { start, end } = req.query;

    // Build the query for expense data
    let query = supabaseAdmin
      .from('daily_income_expense')
      .select('category, price_per_quantity, quantity, item_type')
      .eq('item_type', 'Expense');

    // Apply date filters
    if (start && end) {
      query = query.gte('date', start).lte('date', end);
    } else if (start) {
      query = query.gte('date', start);
    } else if (end) {
      query = query.lte('date', end);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching category breakdown:', error);
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Failed to fetch category breakdown'
      });
    }

    // Process data in memory to calculate breakdown
    const categoryMap = new Map();

    // Calculate total expense
    let totalExpense = 0;
    data.forEach(row => {
      const category = row['category'];
      const pricePerUnit = parseFloat(row['price_per_quantity']) || 0;
      const quantity = parseInt(row['quantity']) || 0;
      const amount = pricePerUnit * quantity;

      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category) + amount);
      } else {
        categoryMap.set(category, amount);
      }
      totalExpense += amount;
    });

    // Convert to array format with percentages
    const result = Array.from(categoryMap.entries()).map(([category, value]) => ({
      category,
      value,
      percent: totalExpense > 0 ? (value / totalExpense) * 100 : 0
    }));

    return res.status(200).json({
      success: true,
      data: result,
      error: null
    });
  } catch (err) {
    console.error('Error in handleGetCategoryBreakdown:', err);
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

  return handleGetCategoryBreakdown(req, res);
}