const { default: fetch } = require('node-fetch');

async function testFrontendFetch() {
  // Test if we can access the frontend
  try {
    console.log('Testing frontend access...');
    const frontendResponse = await fetch('http://localhost:8083');
    console.log('Frontend status:', frontendResponse.status);
  } catch (error) {
    console.error('Error accessing frontend:', error.message);
  }

  // Test if we can access the backend API from the frontend
  try {
    console.log('\nTesting backend API access from frontend...');
    const apiResponse = await fetch('http://localhost:3005/api/transactions', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      }
    });
    console.log('Backend API status:', apiResponse.status);
  } catch (error) {
    console.error('Error accessing backend API:', error.message);
  }
}

testFrontendFetch();