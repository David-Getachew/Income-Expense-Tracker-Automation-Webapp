import fetch from 'node-fetch';

async function testPostTransaction() {
  try {
    const response = await fetch('http://localhost:3005/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_name: 'Test Item',
        quantity: 5,
        price_per_quantity: 100,
        item_type: 'income',
        category: 'Test',
        date: '2025-09-20'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testPostTransaction();