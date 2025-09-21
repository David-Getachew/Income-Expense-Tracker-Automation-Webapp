const { default: fetch } = require('node-fetch');

async function testWeeklySummaries() {
  try {
    const response = await fetch('http://localhost:3005/api/weekly-summaries?start=2025-09-15&end=2025-09-21', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Weekly summaries:', data);
  } catch (error) {
    console.error('Error testing weekly summaries:', error);
  }
}

testWeeklySummaries();