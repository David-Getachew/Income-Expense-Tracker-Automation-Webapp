const { default: fetch } = require('node-fetch');

async function testEndpoints() {
  const baseUrl = 'http://localhost:3005/api';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Get today's date and 30 days ago for testing
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);
  
  const formatDate = (date) => date.toISOString().split('T')[0];
  const startDate = formatDate(thirtyDaysAgo);
  const endDate = formatDate(today);

  try {
    console.log('Testing GET /api/transactions...');
    const transactionsResponse = await fetch(`${baseUrl}/transactions?start=${startDate}&end=${endDate}`, {
      headers
    });
    console.log('Status:', transactionsResponse.status);
    const transactionsData = await transactionsResponse.json();
    console.log('Response:', JSON.stringify(transactionsData, null, 2));
  } catch (error) {
    console.error('Error testing transactions endpoint:', error.message);
  }

  try {
    console.log('\nTesting GET /api/kpis...');
    const kpisResponse = await fetch(`${baseUrl}/kpis?start=${startDate}&end=${endDate}`, {
      headers
    });
    console.log('Status:', kpisResponse.status);
    const kpisData = await kpisResponse.json();
    console.log('Response:', JSON.stringify(kpisData, null, 2));
  } catch (error) {
    console.error('Error testing kpis endpoint:', error.message);
  }

  try {
    console.log('\nTesting GET /api/top-revenue-items...');
    const topRevenueItemsResponse = await fetch(`${baseUrl}/top-revenue-items?start=${startDate}&end=${endDate}&limit=5`, {
      headers
    });
    console.log('Status:', topRevenueItemsResponse.status);
    const topRevenueItemsData = await topRevenueItemsResponse.json();
    console.log('Response:', JSON.stringify(topRevenueItemsData, null, 2));
  } catch (error) {
    console.error('Error testing top-revenue-items endpoint:', error.message);
  }

  try {
    console.log('\nTesting GET /api/expenses-by-category...');
    const expensesByCategoryResponse = await fetch(`${baseUrl}/expenses-by-category?start=${startDate}&end=${endDate}`, {
      headers
    });
    console.log('Status:', expensesByCategoryResponse.status);
    const expensesByCategoryData = await expensesByCategoryResponse.json();
    console.log('Response:', JSON.stringify(expensesByCategoryData, null, 2));
  } catch (error) {
    console.error('Error testing expenses-by-category endpoint:', error.message);
  }

  try {
    console.log('\nTesting POST /api/transactions...');
    const postResponse = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        itemName: 'Test Item 2',
        quantity: 3,
        pricePerUnit: 15,
        itemType: 'expense',
        category: 'Supplies',
        date: '2025-09-20'
      })
    });
    console.log('Status:', postResponse.status);
    const postData = await postResponse.json();
    console.log('Response:', JSON.stringify(postData, null, 2));
  } catch (error) {
    console.error('Error testing POST transactions endpoint:', error.message);
  }
}

testEndpoints();