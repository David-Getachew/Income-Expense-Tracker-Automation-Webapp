// src/pages/api/weekly-summaries.js
// API endpoint for weekly summaries

import { supabaseAdmin } from '../../lib/supabaseClient.server.js';

// GET /api/weekly-summaries
export async function handleGetWeeklySummaries(req, res) {
  try {
    // Query weekly_summaries table ordered by most recent first
    const { data, error } = await supabaseAdmin
      .from('weekly_summaries')
      .select('*')
      .order('week_start', { ascending: false });

    if (error) {
      console.error('Error fetching weekly summaries:', error);
      return res.status(500).json({
        success: false,
        data: [],
        error: 'Failed to fetch weekly summaries'
      });
    }

    // Always return an array to prevent frontend crashes
    const safeData = Array.isArray(data) ? data : [];
    
    return res.status(200).json({
      success: true,
      data: safeData,
      error: null
    });
  } catch (err) {
    console.error('Error in handleGetWeeklySummaries:', err);
    return res.status(500).json({
      success: false,
      data: [],
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

  return handleGetWeeklySummaries(req, res);
}
