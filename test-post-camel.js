import fetch from 'node-fetch';

async function testPostTransactionCamelCase() {
  try {
    const response = await fetch('http://localhost:3005/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemName: 'Test Camel Case Item',
        quantity: 3,
        pricePerUnit: 75,
        itemType: 'expense',
        category: 'Test Camel',
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

testPostTransactionCamelCase();