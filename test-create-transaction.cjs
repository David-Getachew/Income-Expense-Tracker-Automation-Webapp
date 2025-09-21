const { default: fetch } = require('node-fetch');

async function testCreateTransaction() {
  try {
    const response = await fetch('http://localhost:3005/api/transactions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        itemName: 'Test Item',
        quantity: 5,
        pricePerUnit: 10,
        itemType: 'Income',
        category: 'Food',
        date: '2025-09-19'
      })
    });
    
    const data = await response.json();
    console.log('Create transaction response:', data);
    console.log('Response status:', response.status);
  } catch (error) {
    console.error('Error creating transaction:', error);
  }
}

testCreateTransaction();