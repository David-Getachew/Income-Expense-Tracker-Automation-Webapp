const { default: fetch } = require('node-fetch');

async function testKpis() {
  try {
    const response = await fetch('http://localhost:3005/api/kpis', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('KPIs response:', data);
    console.log('Response status:', response.status);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
  }
}

testKpis();