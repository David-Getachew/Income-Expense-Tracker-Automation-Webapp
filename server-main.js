// server-main.js
// Main server implementation (separated to allow environment variables to load first)

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(express.json());

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8083', 'http://localhost:8084'],  // allow common frontend ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// API Routes
app.get('/api/transactions', async (req, res) => {
  const handler = (await import('./src/pages/api/transactions.js')).default;
  return handler(req, res);
});

app.post('/api/transactions', async (req, res) => {
  const handler = (await import('./src/pages/api/transactions.js')).default;
  return handler(req, res);
});

app.get('/api/daily-summaries', async (req, res) => {
  const handler = (await import('./src/pages/api/daily-summaries.js')).default;
  return handler(req, res);
});

app.get('/api/weekly-summaries', async (req, res) => {
  const handler = (await import('./src/pages/api/weekly-summaries.js')).default;
  return handler(req, res);
});

app.get('/api/top-items', async (req, res) => {
  const handler = (await import('./src/pages/api/top-items.js')).default;
  return handler(req, res);
});

app.get('/api/category-breakdown', async (req, res) => {
  const handler = (await import('./src/pages/api/category-breakdown.js')).default;
  return handler(req, res);
});

app.get('/api/report-signed-url', async (req, res) => {
  const handler = (await import('./src/pages/api/report-signed-url.js')).default;
  return handler(req, res);
});

app.get('/api/dashboard', async (req, res) => {
  const handler = (await import('./src/pages/api/dashboard.js')).default;
  return handler(req, res);
});

// New API endpoints for dashboard filters
app.get('/api/kpis', async (req, res) => {
  const handler = (await import('./src/pages/api/kpis.js')).default;
  return handler(req, res);
});

app.get('/api/top-revenue-items', async (req, res) => {
  const handler = (await import('./src/pages/api/top-revenue-items.js')).default;
  return handler(req, res);
});

app.get('/api/expenses-by-category', async (req, res) => {
  const handler = (await import('./src/pages/api/expenses-by-category.js')).default;
  return handler(req, res);
});

// Serve static files from the dist folder (for production)
app.use(express.static(path.join(__dirname, 'dist')));

// For all other routes, serve the frontend (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
export default function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/`);
  });
  
  // Handle server errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please use a different port.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
    }
  });
}