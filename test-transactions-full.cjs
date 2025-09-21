const { default: fetch } = require('node-fetch');

async function testTransactionsAPIFull() {
  try {
    const response = await fetch('http://localhost:3005/api/transactions?start=2025-09-01&end=2025-09-19', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Sample transactions:');
    data.data.rows.slice(0, 10).forEach((row, index) => {
      console.log(`${index + 1}. Date: ${row.date}, Item: ${row.item_name}, Type: ${row.item_type}, Category: ${row.category}, Quantity: ${row.quantity}, Price: ${row.price_per_quantity}`);
    });
  } catch (error) {
    console.error('Error testing Transactions API:', error);
  }
}

testTransactionsAPIFull();