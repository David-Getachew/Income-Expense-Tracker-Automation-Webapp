import fetch from 'node-fetch';

async function testPostTransactionError() {
  try {
    const response = await fetch('http://localhost:3005/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_name: 'Test Item', // Missing quantity, price_per_quantity, item_type, category, date
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testPostTransactionError();