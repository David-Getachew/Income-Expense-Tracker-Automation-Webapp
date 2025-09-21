const { default: fetch } = require('node-fetch');

async function testDashboardAPI() {
  try {
    console.log('Testing dashboard API with parameters:');
    console.log('start: 2025-09-19');
    console.log('end: 2025-09-19');
    console.log('granularity: daily');
    
    const response = await fetch('http://localhost:3005/api/dashboard?start=2025-09-19&end=2025-09-19&granularity=daily', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Dashboard API Response:', JSON.stringify(data, null, 2));
    console.log('Response status:', response.status);
  } catch (error) {
    console.error('Error testing Dashboard API:', error);
  }
}

testDashboardAPI();