// Test direct database insert
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

async function testDbInsert() {
  try {
    const { data, error } = await supabase
      .from('daily_income_expense')
      .insert({
        item_name: 'Test Item',
        quantity: 5,
        price_per_quantity: 10,
        item_type: 'Income',
        category: 'Food',
        date: '2025-09-19'
      })
      .select();

    if (error) {
      console.error('Database insert error:', error);
    } else {
      console.log('Database insert success:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testDbInsert();