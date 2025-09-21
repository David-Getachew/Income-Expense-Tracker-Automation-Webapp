const { default: fetch } = require('node-fetch');

async function testGetTransactionsRPC() {
  try {
    // First, let's check what the transactions endpoint returns
    const response = await fetch('http://localhost:3005/api/transactions?start=2025-09-19&end=2025-09-19', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Transactions for 2025-09-19:', data);
  } catch (error) {
    console.error('Error testing get_transactions RPC:', error);
  }
}

testGetTransactionsRPC();