// src/lib/api.js
// API wrapper functions that replace mock data calls
// This is the only file that should be modified in the frontend

// Use relative paths for same-origin requests
const API_BASE_URL = '';

// Helper function to make API requests with proper error handling
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Ensure endpoint starts with /
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function to get auth token from localStorage
// In a real implementation, this would come from Supabase auth
const getAuthToken = () => {
  // Get the user from localStorage
  const storedUser = localStorage.getItem('foodBizUser');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    // For now, we'll use a placeholder token for testing
    // In a real implementation, this would be a real Supabase access token
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  }
  return null;
};

// Helper function to ensure start and end dates are provided
const ensureDateRange = (start, end) => {
  if (!start || !end) {
    // Set defaults to last 30 days if UI hasn't provided values
    const endDate = new Date().toISOString().slice(0,10);
    const s = new Date(); 
    s.setDate(s.getDate()-29);
    const startDate = s.toISOString().slice(0,10);
    return { start: startDate, end: endDate };
  }
  return { start, end };
};

// Transactions API
export const getTransactions = async (filters = {}) => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ensure start and end are always provided
  const { start, end } = ensureDateRange(filters.start, filters.end);
  
  const queryParams = new URLSearchParams();
  queryParams.append('start', start);
  queryParams.append('end', end);
  
  // Add other filters if provided
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && key !== 'start' && key !== 'end') {
      queryParams.append(key, filters[key]);
    }
  });

  const queryString = queryParams.toString();
  const url = `/api/transactions${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiRequest(url, { headers });
  // Ensure we always return the correct structure
  return response;
};

export const createTransaction = async (transactionData) => {
  try {
    const token = getAuthToken();
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log the data being sent for debugging
    console.log('Sending transaction data:', transactionData);
    
    const response = await apiRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
      headers,
    });
    
    console.log('Transaction API response:', response);
    return response;
  } catch (error) {
    console.error('createTransaction failed:', error);
    throw error;
  }
};

// Dashboard API
export const getDashboardData = async (start, end, granularity = 'auto') => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ensure start and end are always provided
  const dateRange = ensureDateRange(start, end);
  
  const queryParams = new URLSearchParams();
  queryParams.append('start', dateRange.start);
  queryParams.append('end', dateRange.end);
  if (granularity) queryParams.append('granularity', granularity);
  
  const response = await apiRequest(`/api/dashboard?${queryParams.toString()}`, { headers });
  // Handle the response format from the API
  // API returns array directly
  return Array.isArray(response) ? response : [];
};

// KPIs API
export const getKpis = async (start, end) => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ensure start and end are always provided
  const dateRange = ensureDateRange(start, end);
  
  const queryParams = new URLSearchParams();
  queryParams.append('start', dateRange.start);
  queryParams.append('end', dateRange.end);
  
  const response = await apiRequest(`/api/kpis?${queryParams.toString()}`, { headers });
  // Ensure we always return the correct structure with fallback values
  return response || { total_income: 0, total_expense: 0, net_income: 0 };
};

// Summaries API
export const getDailySummaries = async (start, end) => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ensure start and end are always provided
  const dateRange = ensureDateRange(start, end);
  
  const queryParams = new URLSearchParams();
  queryParams.append('start', dateRange.start);
  queryParams.append('end', dateRange.end);
  
  const response = await apiRequest(`/daily-summaries?${queryParams.toString()}`, { headers });
  return response;
};

export const getWeeklySummaries = async (start, end) => {
  try {
    const token = getAuthToken();
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ensure start and end are always provided
    const dateRange = ensureDateRange(start, end);
    
    const queryParams = new URLSearchParams();
    queryParams.append('start', dateRange.start);
    queryParams.append('end', dateRange.end);
    
    const response = await apiRequest(`/api/weekly-summaries?${queryParams.toString()}`, { headers });
    // Always return an array to prevent frontend crashes
    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error('getWeeklySummaries failed:', error);
    return [];
  }
};

// Analytics API
export const getTopItems = async (params = {}) => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });

  const response = await apiRequest(`/top-items?${queryParams.toString()}`, { headers });
  return response;
};

// Top Revenue Items API
export const getTopRevenueItems = async (start, end, limit = 5) => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ensure start and end are always provided
  const dateRange = ensureDateRange(start, end);
  
  const queryParams = new URLSearchParams();
  queryParams.append('start', dateRange.start);
  queryParams.append('end', dateRange.end);
  if (limit) queryParams.append('limit', limit);
  
  const response = await apiRequest(`/api/top-revenue-items?${queryParams.toString()}`, { headers });
  // Ensure we always return an array
  return Array.isArray(response) ? response : [];
};

export const getCategoryBreakdown = async (start, end) => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ensure start and end are always provided
  const dateRange = ensureDateRange(start, end);
  
  const queryParams = new URLSearchParams();
  queryParams.append('start', dateRange.start);
  queryParams.append('end', dateRange.end);
  
  const response = await apiRequest(`/category-breakdown?${queryParams.toString()}`, { headers });
  return response;
};

// Expenses by Category API
export const getExpensesByCategory = async (start, end) => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Ensure start and end are always provided
  const dateRange = ensureDateRange(start, end);
  
  const queryParams = new URLSearchParams();
  queryParams.append('start', dateRange.start);
  queryParams.append('end', dateRange.end);
  
  const response = await apiRequest(`/api/expenses-by-category?${queryParams.toString()}`, { headers });
  // Ensure we always return an array
  return Array.isArray(response) ? response : [];
};

// Report API
export const getReportSignedUrl = async (path) => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await apiRequest(`/report-signed-url?path=${encodeURIComponent(path)}`, {
    headers,
  });
  return response;
};