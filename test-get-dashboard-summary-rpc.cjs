// Test RPC function for get_dashboard_summary
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testGetDashboardSummaryRpc() {
  try {
    console.log('Calling get_dashboard_summary RPC with parameters:');
    console.log({
      start_date: '2025-09-19',
      end_date: '2025-09-19',
      granularity: 'daily'
    });
    
    const { data, error } = await supabase.rpc('get_dashboard_summary', {
      start_date: '2025-09-19',
      end_date: '2025-09-19',
      granularity: 'daily'
    });

    if (error) {
      console.error('get_dashboard_summary RPC error:', error);
    } else {
      console.log('get_dashboard_summary RPC success:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testGetDashboardSummaryRpc();