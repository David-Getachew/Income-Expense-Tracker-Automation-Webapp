// Test RPC function for get_transactions
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

async function testGetTransactionsRpc() {
  try {
    console.log('Calling get_transactions RPC with parameters:');
    console.log({
      start_date: '2025-09-19',
      end_date: '2025-09-19'
    });
    
    const { data, error } = await supabase.rpc('get_transactions', {
      start_date: '2025-09-19',
      end_date: '2025-09-19'
    });

    if (error) {
      console.error('get_transactions RPC error:', error);
    } else {
      console.log('get_transactions RPC success. Number of records:', data ? data.length : 0);
      if (data && data.length > 0) {
        console.log('First record:', data[0]);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testGetTransactionsRpc();