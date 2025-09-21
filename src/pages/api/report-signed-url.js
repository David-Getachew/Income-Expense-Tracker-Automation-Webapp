// src/pages/api/report-signed-url.js
// API endpoint for generating signed URLs for reports

import { supabaseAdmin } from '../../lib/supabaseClient.server.js';
import { validateOwner } from '../../lib/auth.js';

// GET /api/report-signed-url
export async function handleGetReportSignedUrl(req, res) {
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
      return res.status(403).json({
        success: false,
        data: null,
        error: 'Unauthorized: Only owner can access report URLs'
      });
    }

    const { path } = req.query;

    if (!path) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Missing path parameter'
      });
    }

    // If the path is an external URL, return it as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return res.status(200).json({
        success: true,
        data: {
          url: path
        },
        error: null
      });
    }

    // Assume the path is in Supabase Storage
    // Parse the path to extract bucket and file path
    // Expected format: bucket_name/path/to/file.ext
    const pathParts = path.split('/');
    if (pathParts.length < 2) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Invalid path format. Expected: bucket_name/path/to/file'
      });
    }

    const bucket = pathParts[0];
    const filePath = pathParts.slice(1).join('/');

    // Generate signed URL
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error generating signed URL:', error);
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Failed to generate signed URL'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        url: data.signedUrl
      },
      error: null
    });
  } catch (err) {
    console.error('Error in handleGetReportSignedUrl:', err);
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

  return handleGetReportSignedUrl(req, res);
}