# Supabase Integration Guide

This document explains how to integrate the Income-Expense Tracker frontend with Supabase backend services.

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OWNER_EMAIL=your-email@example.com
NODE_ENV=development
```

## API Endpoints

All endpoints return data in the format:
```json
{
  "success": boolean,
  "data": <payload>,
  "error": <message|null>
}
```

### 1. GET `/api/transactions`

Fetch transactions with filters, pagination, and sorting.

**Query Parameters:**
- `start` (ISO date) - Optional start date
- `end` (ISO date) - Optional end date
- `type` (Income|Expense) - Optional filter by type
- `category` - Optional filter by category
- `processed` (true|false) - Optional filter by processed status
- `page` (1-based) - Optional page number (default: 1)
- `perPage` - Optional items per page (default: 25, max: 100)
- `sort` (date.asc|date.desc) - Optional sort order (default: date.desc)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "123",
        "itemName": "Injera",
        "quantity": 50,
        "unit": "unit",
        "pricePerUnit": 5,
        "itemType": "Income",
        "category": "Food",
        "date": "2025-09-10T00:00:00Z",
        "processed": null,
        "amount": 250
      }
    ],
    "total": 1,
    "page": 1,
    "perPage": 25
  },
  "error": null
}
```

### 2. POST `/api/transactions`

Create a new transaction.

**Request Body:**
```json
{
  "itemName": "Injera",
  "quantity": 50,
  "unit": "unit",
  "pricePerUnit": 5,
  "itemType": "Income",
  "category": "Food",
  "date": "2025-09-10"
}
```

**Authorization:** Requires Bearer token in Authorization header.
**Response:** Returns the created transaction with normalized fields.

### 3. GET `/api/daily-summaries`

Fetch daily income/expense summaries for a date range.

**Query Parameters:**
- `start` (ISO date) - Optional start date
- `end` (ISO date) - Optional end date

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-09-10",
      "totalIncome": 250,
      "totalExpense": 800,
      "netProfit": -550
    }
  ],
  "error": null
}
```

### 4. GET `/api/weekly-summaries`

Fetch weekly summaries with report links.

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "weekStart": "2025-09-08",
      "weekEnd": "2025-09-14",
      "totalIncome": 1375,
      "totalExpense": 1020,
      "netProfit": 355,
      "analysis": "Sales were strongest mid-week...",
      "pdfUrl": "storage/reports/week2.pdf",
      "signedPdfUrl": "https://your-project.supabase.co/storage/v1/object/sign/reports/week2.pdf?token=..."
    }
  ],
  "error": null
}
```

### 5. GET `/api/top-items`

Get top items by revenue or quantity.

**Query Parameters:**
- `start` (ISO date) - Optional start date
- `end` (ISO date) - Optional end date
- `by` (revenue|quantity) - Sort by revenue or quantity (default: revenue)
- `limit` (1-20) - Number of items to return (default: 5)

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "itemName": "Cappuccino",
      "revenue": 1200,
      "quantity": 45
    }
  ],
  "error": null
}
```

### 6. GET `/api/category-breakdown`

Get expense breakdown by category.

**Query Parameters:**
- `start` (ISO date) - Optional start date
- `end` (ISO date) - Optional end date

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "Supply",
      "value": 1410,
      "percent": 65.43
    }
  ],
  "error": null
}
```

### 7. GET `/api/report-signed-url`

Generate a signed URL for a report stored in Supabase Storage.

**Query Parameters:**
- `path` - Path to the file (bucket_name/path/to/file or external URL)

**Authorization:** Requires Bearer token in Authorization header.
**Example Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://your-project.supabase.co/storage/v1/object/sign/reports/week2.pdf?token=..."
  },
  "error": null
}
```

## Frontend Integration

To switch from mock data to live data:

1. Ensure `src/lib/api.js` is being imported in your components
2. The functions in `src/lib/api.js` replace the mock data functions
3. No changes needed to UI components - they should work with the new data format

## Authentication

- Frontend uses Supabase magic-link authentication
- Owner-only operations require a valid Bearer token in the Authorization header
- The server validates that the token belongs to the email specified in `OWNER_EMAIL`

## Deployment

When deploying to production:

1. Set the environment variables in your hosting platform
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is kept secret and only used server-side
3. Configure your hosting platform to serve the API endpoints correctly

## Testing

Use curl commands to test the endpoints:

```bash
# Get transactions
curl "http://localhost:3000/api/transactions?start=2025-09-10&end=2025-09-16"

# Create a transaction (requires auth token)
curl -X POST "http://localhost:3000/api/transactions" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemName":"Test Item","quantity":10,"pricePerUnit":5,"itemType":"Income","category":"Food","date":"2025-09-17"}'

# Get daily summaries
curl "http://localhost:3000/api/daily-summaries?start=2025-09-10&end=2025-09-16"

# Get weekly summaries
curl "http://localhost:3000/api/weekly-summaries"

# Get top items
curl "http://localhost:3000/api/top-items?start=2025-09-10&end=2025-09-16&by=revenue&limit=6"

# Get category breakdown
curl "http://localhost:3000/api/category-breakdown?start=2025-09-10&end=2025-09-16"

# Get signed URL (requires auth token)
curl "http://localhost:3000/api/report-signed-url?path=reports/week2.pdf" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```