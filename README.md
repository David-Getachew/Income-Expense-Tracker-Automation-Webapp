# Sunset Sips n' Bites - Income Expense Tracker

This is a web application for tracking income and expenses for the "Sunset Sips n' Bites" business. The application is integrated with Supabase for backend data storage and retrieval.

## Prerequisites

- Node.js (version 16 or higher)
- pnpm (package manager)
- Supabase account and project

## Setup Instructions

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   - Copy the `.env.example` file to `.env.local`
   - Update the Supabase configuration variables in `.env.local`:
     ```
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     OWNER_EMAIL=your_owner_email
     ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

4. **Build for production:**
   ```bash
   pnpm build
   ```

## Features

- Dashboard with income/expense tracking and visualizations
- Data entry form for adding new transactions
- Reports page with weekly summaries
- Responsive design for mobile and desktop

## Supabase Integration

The application is integrated with Supabase for:
- Authentication
- Data storage and retrieval
- Real-time updates

All data is fetched from and submitted to Supabase tables:
- `daily_income_expense` for transaction data
- `daily_summaries` for daily income/expense summaries
- `weekly_summaries` for weekly reports

## Testing

To run tests:
```bash
pnpm test
```

## Deployment

The application can be deployed to any static hosting service that supports Node.js applications, such as Vercel or Netlify.