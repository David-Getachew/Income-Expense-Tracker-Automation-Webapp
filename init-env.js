// init-env.js
// Initialize environment variables before other modules are loaded

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables as early as possible
const result = dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log('Environment variables loaded:', result.parsed);

// Export a function to initialize the server after environment variables are loaded
export async function initServer() {
  const { default: startServer } = await import('./server-main.js');
  return startServer();
}