const { default: fetch } = require('node-fetch');

async function testTransactionsWithDates() {
  try {
    // Get today's date and 30 days ago
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    const startDate = formatDate(thirtyDaysAgo);
    const endDate = formatDate(today);
    
    const response = await fetch(`http://localhost:3005/api/transactions?start=${startDate}&end=${endDate}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Transactions with dates response:', data);
    console.log('Response status:', response.status);
  } catch (error) {
    console.error('Error fetching Transactions with dates:', error);
  }
}

testTransactionsWithDates();