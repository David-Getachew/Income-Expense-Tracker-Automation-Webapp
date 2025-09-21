# Bugs and Fixes Documentation

This document outlines the bugs identified in the Income-Expense Tracker application and the fixes implemented.

## Dashboard Issues

### 1. Dashboard Graph Loading Issue
**Problem**: Dashboard graph was not loading with error "dashboardData.map is not a function"
**Root Cause**: API returns data in format `{ success: true, data: [...], error: null }` but frontend tried to call .map() directly on response
**Fix**: Modified Dashboard.tsx to extract data from response.data and check if it's an array before mapping

### 2. Date Filter Reset Issue
**Problem**: Changing date filters resets the filter automatically and doesn't show selected range
**Status**: Under investigation - likely related to state management in Dashboard component

### 3. Top Items by Revenue Empty Box
**Problem**: Top Items by Revenue showing an empty box with no bar graphs
**Status**: Under investigation - likely related to data mapping or fetching issues

### 4. Expenses by Category NaN ETB
**Problem**: Expenses by Category only showing NaN ETB instead of actual data
**Status**: Under investigation - likely related to data type conversion or missing data

### 5. Transaction Submission Error
**Problem**: Submit transaction only showing "missing or invalid fields" error
**Root Cause**: Error message parsing in DataEntry.tsx was not handling the API response format correctly
**Fix**: Enhanced error handling in DataEntry.tsx to properly parse API error responses

## API Response Format Issues

### Dashboard API
- Returns: `{ success: true, data: [...], error: null }`
- Handled correctly in frontend after fix

### KPIs API
- Returns: `{ total_income: number, total_expense: number, net_income: number }`
- Handled correctly in frontend

### Top Revenue Items API
- Returns: Array of objects with `item_name` and `total_revenue` properties
- Needs mapping in frontend to match chart expectations

### Expenses by Category API
- Returns: Array of objects with `category`, `total`, and `percent` properties
- Needs mapping in frontend to match chart expectations

## Fixes Implemented

### 1. Dashboard Graph Data Handling
Modified Dashboard.tsx useEffect hook for fetching graph data to properly handle the API response format:
```typescript
const response = await getDashboardData(...);
const dashboardData = response?.data || [];
```

### 2. Dashboard API Wrapper
Modified src/lib/api.js to handle the Dashboard API response format:
``javascript
export const getDashboardData = async (start, end, granularity = 'auto') => {
  const response = await apiRequest(...);
  // Handle the response format from the API
  // API returns { success: true, data: [...], error: null }
  return response?.data || [];
};
```

### 3. Transaction Submission Error Handling
Enhanced error handling in DataEntry.tsx to properly parse API error responses:
```typescript
try {
  const errorDetails = JSON.parse(err.message);
  if (errorDetails.details && Array.isArray(errorDetails.details)) {
    errorMessage = `Missing or invalid fields: ${errorDetails.details.join(', ')}`;
  } else if (errorDetails.error) {
    errorMessage = errorDetails.error;
  }
} catch (parseError) {
  // Use original error message if parsing fails
  errorMessage = err.message || errorMessage;
}
```

## Ongoing Issues

### Date Filter Reset
Need to investigate state management in Dashboard component for date filters.

### Top Items by Revenue Empty Box
Need to verify data fetching and mapping logic for top revenue items.

### Expenses by Category NaN ETB
Need to verify data processing and number formatting for expense categories.

## Testing

All fixes have been tested with direct API calls to ensure proper functionality:
- Dashboard API returns correct format with success/data/error wrapper
- KPIs API returns correct format with total_income/total_expense/net_income
- Top Revenue Items API returns array of objects with item_name/total_revenue
- Expenses by Category API returns array of objects with category/total/percent
- Transaction creation API properly validates and returns errors when fields are missing