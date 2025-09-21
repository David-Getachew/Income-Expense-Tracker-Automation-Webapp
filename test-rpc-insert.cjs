// Test RPC function for insert_transaction
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

async function testRpcInsert() {
  try {
    console.log('Calling RPC with parameters:');
    console.log({
      p_item_name: 'Test RPC Item',
      p_quantity: 3,
      p_price_per_quantity: 15,
      p_item_type: 'Expense',
      p_date: '2025-09-19'
    });
    
    const { data, error } = await supabase.rpc('insert_transaction', {
      p_item_name: 'Test RPC Item',
      p_quantity: 3,
      p_price_per_quantity: 15,
      p_item_type: 'Expense',
      p_date: '2025-09-19'
    });

    if (error) {
      console.error('RPC insert error:', error);
    } else {
      console.log('RPC insert success:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testRpcInsert();