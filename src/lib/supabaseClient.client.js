// src/lib/supabaseClient.client.js
// Client-side Supabase client using ANON_KEY
// This file is for client-side authentication only

const { createClient } = require('@supabase/supabase-js');

// Ensure these environment variables are set
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client with anon key for client-side operations
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

module.exports = {
  supabaseClient
};