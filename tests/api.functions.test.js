/**
 * @jest-environment jsdom
 */
// tests/api.functions.test.js
// Unit tests for the API wrapper functions

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value.toString(),
    removeItem: (key) => delete store[key],
    clear: () => store = {}
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the fetch function
global.fetch = jest.fn();

const api = require('../src/lib/api.js');

describe('API Wrapper Functions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up default mock response
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [],
        error: null
      })
    });
    
    // Set up localStorage with a mock user
    localStorage.setItem('foodBizUser', JSON.stringify({
      email: 'owner@example.com'
    }));
  });

  afterEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  test('getTransactions should call the correct endpoint', async () => {
    await api.getTransactions();
    expect(fetch).toHaveBeenCalledWith('http://localhost:3005/api/transactions', expect.objectContaining({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      }
    }));
  });

  test('getTransactions should handle filters correctly', async () => {
    await api.getTransactions({ start: '2025-09-10', end: '2025-09-16' });
    expect(fetch).toHaveBeenCalledWith('http://localhost:3005/api/transactions?start=2025-09-10&end=2025-09-16', expect.any(Object));
  });

  test('getDailySummaries should call the correct endpoint', async () => {
    await api.getDailySummaries('2025-09-10', '2025-09-16');
    expect(fetch).toHaveBeenCalledWith('http://localhost:3005/api/daily-summaries?start=2025-09-10&end=2025-09-16', expect.objectContaining({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      }
    }));
  });

  test('getWeeklySummaries should call the correct endpoint', async () => {
    await api.getWeeklySummaries();
    expect(fetch).toHaveBeenCalledWith('http://localhost:3005/api/weekly-summaries', expect.objectContaining({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      }
    }));
  });

  test('getDashboardData should call the correct endpoint', async () => {
    await api.getDashboardData('2025-09-10', '2025-09-16', 'daily');
    expect(fetch).toHaveBeenCalledWith('http://localhost:3005/api/dashboard?start=2025-09-10&end=2025-09-16&granularity=daily', expect.objectContaining({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      }
    }));
  });

  test('getDashboardData should work with auto granularity', async () => {
    await api.getDashboardData('2025-09-10', '2025-09-16');
    expect(fetch).toHaveBeenCalledWith('http://localhost:3005/api/dashboard?start=2025-09-10&end=2025-09-16&granularity=auto', expect.objectContaining({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      }
    }));
  });
});