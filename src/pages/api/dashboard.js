// src/pages/api/dashboard.js
// API endpoint for dashboard data using RPC functions

import { supabaseAdmin } from '../../lib/supabaseClient.server.js';
import { validateOwner } from '../../lib/auth.js';

// GET /api/dashboard
export async function handleGetDashboard(req, res) {
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

    const { start, end, granularity = 'auto' } = req.query;

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

    // Calculate days difference for auto granularity
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Determine granularity
    let effectiveGranularity = granularity;
    if (granularity === 'auto') {
      effectiveGranularity = daysDiff > 30 ? 'weekly' : 'daily';
    }

    // Try to call the RPC function first
    let rpcResult;
    try {
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_dashboard_summary', {
        start_date: start,
        end_date: end,
        granularity: effectiveGranularity
      });

      if (!rpcError && rpcData) {
        rpcResult = rpcData;
      }
    } catch (rpcErr) {
      // RPC not available, will fall back to direct query
      console.log('RPC get_dashboard_summary not available, falling back to direct query');
    }

    // If RPC succeeded, return the data
    if (rpcResult) {
      // Normalize the data to match expected format
      const normalizedData = rpcResult.map(row => ({
        label: row.date_period,  // Use date_period instead of label
        totalIncome: parseFloat(row.total_income) || 0,
        totalExpense: parseFloat(row.total_expense) || 0,
        netProfit: parseFloat(row.net_profit) || 0
      }));

      return res.status(200).json({
        success: true,
        data: normalizedData,
        error: null
      });
    }

    // Fall back to direct query based on granularity
    if (effectiveGranularity === 'daily') {
      // Try daily summaries RPC
      try {
        const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_daily_summaries', {
          start_date: start,
          end_date: end
        });

        if (!rpcError && rpcData) {
          // Normalize the data
          const normalizedData = rpcData.map(row => ({
            label: row.date,
            totalIncome: parseFloat(row.total_income) || 0,
            totalExpense: parseFloat(row.total_expense) || 0,
            netProfit: parseFloat(row.net_profit) || 0
          }));

          return res.status(200).json({
            success: true,
            data: normalizedData,
            error: null
          });
        }
      } catch (rpcErr) {
        console.log('RPC get_daily_summaries not available, falling back to direct query');
      }

      // Fall back to direct aggregation from daily_income_expense
      let query = supabaseAdmin
        .from('daily_income_expense')
        .select('date, item_type, price_per_quantity, quantity')
        .gte('date', start)
        .lte('date', end);

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
            label: date,
            totalIncome: 0,
            totalExpense: 0,
            netProfit: 0
          });
        }

        const dateEntry = dateMap.get(date);
        // Handle Income and Expense item types
        if (itemType === 'Income') {
          dateEntry.totalIncome += amount;
        } else if (itemType === 'Expense') {
          dateEntry.totalExpense += amount;
        }
        dateEntry.netProfit = dateEntry.totalIncome - dateEntry.totalExpense;
      });

      // Convert to array and sort by date
      const result = Array.from(dateMap.values());
      result.sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());

      return res.status(200).json({
        success: true,
        data: result,
        error: null
      });
    } else if (effectiveGranularity === 'weekly') {
      // Try weekly summaries RPC
      try {
        const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_weekly_summaries', {
          start_date: start,
          end_date: end
        });

        if (!rpcError && rpcData) {
          // Normalize the data
          const normalizedData = rpcData.map(row => ({
            label: `${row.week_start} to ${row.week_end}`,
            totalIncome: parseFloat(row.total_income) || 0,
            totalExpense: parseFloat(row.total_expense) || 0,
            netProfit: parseFloat(row.net_profit) || 0
          }));

          return res.status(200).json({
            success: true,
            data: normalizedData,
            error: null
          });
        }
      } catch (rpcErr) {
        console.log('RPC get_weekly_summaries not available, falling back to direct query');
      }

      // Fall back to direct aggregation (simplified weekly grouping)
      let query = supabaseAdmin
        .from('daily_income_expense')
        .select('date, item_type, price_per_quantity, quantity')
        .gte('date', start)
        .lte('date', end);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching weekly income/expense data:', error);
        return res.status(500).json({
          success: false,
          data: null,
          error: 'Failed to fetch weekly data'
        });
      }

      // Group by week (simplified implementation)
      const weekMap = new Map();

      data.forEach(row => {
        const date = new Date(row['date']);
        // Get the start of the week (Sunday)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        // Get the end of the week (Saturday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekKey = weekStart.toISOString().split('T')[0];
        
        const itemType = row['item_type'];
        const pricePerUnit = parseFloat(row['price_per_quantity']) || 0;
        const quantity = parseInt(row['quantity']) || 0;
        const amount = pricePerUnit * quantity;

        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, {
            label: `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`,
            totalIncome: 0,
            totalExpense: 0,
            netProfit: 0
          });
        }

        const weekEntry = weekMap.get(weekKey);
        // Handle Income and Expense item types
        if (itemType === 'Income') {
          weekEntry.totalIncome += amount;
        } else if (itemType === 'Expense') {
          weekEntry.totalExpense += amount;
        }
        weekEntry.netProfit = weekEntry.totalIncome - weekEntry.totalExpense;
      });

      // Convert to array and sort by week
      const result = Array.from(weekMap.values());
      result.sort((a, b) => new Date(a.label.split(' to ')[0]).getTime() - new Date(b.label.split(' to ')[0]).getTime());

      return res.status(200).json({
        success: true,
        data: result,
        error: null
      });
    }

    // Default case - return empty array
    return res.status(200).json({
      success: true,
      data: [],
      error: null
    });
  } catch (err) {
    console.error('Error in handleGetDashboard:', err);
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

  return handleGetDashboard(req, res);
}