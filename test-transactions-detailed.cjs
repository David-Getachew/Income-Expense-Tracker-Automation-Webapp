const { default: fetch } = require('node-fetch');

async function testTransactionsDetailed() {
  try {
    const response = await fetch('http://localhost:3005/api/transactions', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'Content-Type': 'application/json'
      }
    });
    
    const text = await response.text();
    console.log('Transactions response text:', text);
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
  } catch (error) {
    console.error('Error fetching Transactions:', error);
  }
}

testTransactionsDetailed();