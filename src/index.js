import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { setupPriceRoutes } from './services/cryptoService.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiting configuration
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 30; // Maximum requests per minute

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip);
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  next();
};

// Setup price-related routes
setupPriceRoutes(app, rateLimiter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});