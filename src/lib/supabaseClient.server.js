// src/lib/supabaseClient.server.js
// Server-side Supabase client using SERVICE_ROLE_KEY
// This file should NEVER be imported in client-side code

import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Create Supabase client with service role key for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export { supabaseAdmin };