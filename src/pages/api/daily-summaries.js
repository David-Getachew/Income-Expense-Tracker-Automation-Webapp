// src/pages/api/daily-summaries.js
// API endpoint for daily summaries

import { supabaseAdmin } from '../../lib/supabaseClient.server.js';
import { validateOwner } from '../../lib/auth.js';

// GET /api/daily-summaries
export async function handleGetDailySummaries(req, res) {
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

    // Validate required parameters
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Missing required parameters: start and end dates'
      });
    }

    // Validate date format
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Try to call the RPC function first
    let rpcResult;
    try {
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_daily_summaries', {
        start_date: start,
        end_date: end
      });

      if (!rpcError && rpcData) {
        rpcResult = rpcData;
      }
    } catch (rpcErr) {
      // RPC not available, will fall back to direct query
      console.log('RPC get_daily_summaries not available, falling back to direct query');
    }

    // If RPC succeeded, return the data
    if (rpcResult) {
      // Normalize the data to match expected format
      const normalizedData = rpcResult.map(row => ({
        date: row.date,
        totalIncome: row.total_income || 0,
        totalExpense: row.total_expense || 0,
        netProfit: row.net_profit || 0
      }));

      return res.status(200).json({
        success: true,
        data: normalizedData,
        error: null
      });
    }

    // Fall back to direct query if RPC is not available
    // First, try to get data from the Daily Summaries table if it exists
    let summariesQuery = supabaseAdmin
      .from('daily_summaries')
      .select('*');

    if (start && end) {
      summariesQuery = summariesQuery.gte('date', start).lte('date', end);
    } else if (start) {
      summariesQuery = summariesQuery.gte('date', start);
    } else if (end) {
      summariesQuery = summariesQuery.lte('date', end);
    }

    summariesQuery = summariesQuery.order('date', { ascending: true });

    const { data: summariesData, error: summariesError } = await summariesQuery;

    // If we successfully got data from Daily Summaries, return it
    if (!summariesError && summariesData && summariesData.length > 0) {
      const normalizedData = summariesData.map(row => ({
        date: row.date,
        totalIncome: row.total_income || 0,
        totalExpense: row.total_expense || 0,
        netProfit: row.net_profit || (row.total_income - row.total_expense) || 0
      }));

      return res.status(200).json({
        success: true,
        data: normalizedData,
        error: null
      });
    }

    // If no data in Daily Summaries table, calculate from daily_income_expense
    let query = supabaseAdmin
      .from('daily_income_expense')
      .select('date, item_type, price_per_quantity, quantity');

    if (start && end) {
      query = query.gte('date', start).lte('date', end);
    } else if (start) {
      query = query.gte('date', start);
    } else if (end) {
      query = query.lte('date', end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching daily income/expense data:', error);
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Failed to fetch daily data'
      });
    }

    // Process data in memory to calculate daily summaries
    const dateMap = new Map();

    data.forEach(row => {
      const date = row['date'];
      const itemType = row['item_type'];
      const pricePerUnit = parseFloat(row['price_per_quantity']) || 0;
      const quantity = parseInt(row['quantity']) || 0;
      const amount = pricePerUnit * quantity;

      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          totalIncome: 0,
          totalExpense: 0
        });
      }

      const dateEntry = dateMap.get(date);
      if (itemType === 'Income') {
        dateEntry.totalIncome += amount;
      } else if (itemType === 'Expense') {
        dateEntry.totalExpense += amount;
      }
    });

    // Convert to array and calculate net profit
    const result = Array.from(dateMap.values()).map(entry => ({
      ...entry,
      netProfit: entry.totalIncome - entry.totalExpense
    }));

    // Sort by date
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return res.status(200).json({
      success: true,
      data: result,
      error: null
    });
  } catch (err) {
    console.error('Error in handleGetDailySummaries:', err);
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

  return handleGetDailySummaries(req, res);
}