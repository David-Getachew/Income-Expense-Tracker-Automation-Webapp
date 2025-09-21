// server.js
// Simple Node.js server to serve API endpoints for the Income-Expense Tracker

import { initServer } from './init-env.js';

// Initialize the server after environment variables are loaded
initServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
