// src/pages/api/weekly-summaries.js
// API endpoint for weekly summaries

import { supabaseAdmin } from '../../lib/supabaseClient.server.js';
import { validateOwner } from '../../lib/auth.js';

// GET /api/weekly-summaries
export async function handleGetWeeklySummaries(req, res) {
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

    // Try to call the RPC function first
    let rpcResult;
    try {
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_weekly_summaries', {
        start_date: start,
        end_date: end
      });

      if (!rpcError && rpcData) {
        rpcResult = rpcData;
      }
    } catch (rpcErr) {
      // RPC not available, will fall back to direct query
      console.log('RPC get_weekly_summaries not available, falling back to direct query');
    }

    // If RPC succeeded, return the data
    if (rpcResult) {
      // Process the data to normalize fields and generate signed URLs where needed
      const normalizedData = await Promise.all(rpcResult.map(async (row) => {
        let signedPdfUrl = row.pdf_url || null;
        
        // If pdf_url points to Supabase Storage, generate a signed URL
        if (row.pdf_url && row.pdf_url.startsWith('storage/')) {
          try {
            // Extract bucket and path from the storage URL
            // Assuming format: storage/bucket_name/path/to/file.pdf
            const pathParts = row.pdf_url.split('/');
            if (pathParts.length >= 3) {
              const bucket = pathParts[1];
              const filePath = pathParts.slice(2).join('/');
              
              const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
                .storage
                .from(bucket)
                .createSignedUrl(filePath, 3600); // 1 hour expiry
              
              if (!signedUrlError && signedUrlData?.signedUrl) {
                signedPdfUrl = signedUrlData.signedUrl;
              }
            }
          } catch (err) {
            console.error('Error generating signed URL:', err);
            // Keep the original URL if signing fails
          }
        }
        
        return {
          week_start: row.week_start,
          week_end: row.week_end,
          total_income: row.total_income || 0,
          total_expense: row.total_expense || 0,
          net_profit: row.net_profit || 0,
          num_income: row.num_income || 0,
          num_expense: row.num_expense || 0,
          analysis: row.analysis || '',
          pdf_url: row.pdf_url || '',
          signed_pdf_url: signedPdfUrl
        };
      }));

      return res.status(200).json({
        success: true,
        data: normalizedData,
        error: null
      });
    }

    // Fall back to direct query if RPC is not available
    // Query the Weekly Summaries table
    let summariesQuery = supabaseAdmin
      .from('weekly_summaries')
      .select('*');

    // Apply date filters if provided
    if (start) {
      summariesQuery = summariesQuery.gte('week_start', start);
    }
    
    if (end) {
      summariesQuery = summariesQuery.lte('week_end', end);
    }

    summariesQuery = summariesQuery.order('week_start', { ascending: false }); // Most recent first

    const { data, error } = await summariesQuery;

    if (error) {
      console.error('Error fetching weekly summaries:', error);
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Failed to fetch weekly summaries'
      });
    }

    // Process the data to normalize fields and generate signed URLs where needed
    const normalizedData = await Promise.all(data.map(async (row) => {
      let signedPdfUrl = row.pdf_url || null;
      
      // If pdf_url points to Supabase Storage, generate a signed URL
      if (row.pdf_url && row.pdf_url.startsWith('storage/')) {
        try {
          // Extract bucket and path from the storage URL
          // Assuming format: storage/bucket_name/path/to/file.pdf
          const pathParts = row.pdf_url.split('/');
          if (pathParts.length >= 3) {
            const bucket = pathParts[1];
            const filePath = pathParts.slice(2).join('/');
            
            const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
              .storage
              .from(bucket)
              .createSignedUrl(filePath, 3600); // 1 hour expiry
            
            if (!signedUrlError && signedUrlData?.signedUrl) {
              signedPdfUrl = signedUrlData.signedUrl;
            }
          }
        } catch (err) {
          console.error('Error generating signed URL:', err);
          // Keep the original URL if signing fails
        }
      }
      
      return {
        week_start: row.week_start,
        week_end: row.week_end,
        total_income: row.total_income || 0,
        total_expense: row.total_expense || 0,
        net_profit: row.net_profit || 0,
        analysis: row.analysis || '',
        pdf_url: row.pdf_url || '',
        signed_pdf_url: signedPdfUrl
      };
    }));

    return res.status(200).json({
      success: true,
      data: normalizedData,
      error: null
    });
  } catch (err) {
    console.error('Error in handleGetWeeklySummaries:', err);
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

  return handleGetWeeklySummaries(req, res);
}