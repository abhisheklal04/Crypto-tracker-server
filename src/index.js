import express from 'express';
import cors from 'cors';
import axios from 'axios';
import 'dotenv/config';
import { CRYPTO_DETAILS, POPULAR_CRYPTOCURRENCIES } from './constants/cryptocurrencies.js';

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

// Helper function to fetch price
const fetchPrice = async (symbol) => {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    return {
      symbol,
      price: parseFloat(response.data.price),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`Error fetching ${symbol} price:`, error);
    throw error;
  }
};

// Endpoint to get price for a specific cryptocurrency
app.get('/api/price/:symbol', rateLimiter, async (req, res) => {
  const symbol = req.params.symbol.toUpperCase() + 'USDT';
  try {
    const data = await fetchPrice(symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch price data for ${symbol}` });
  }
});

// Endpoint to get all popular cryptocurrency prices
app.get('/api/prices', rateLimiter, async (req, res) => {
  try {
    const promises = POPULAR_CRYPTOCURRENCIES.map(symbol => fetchPrice(symbol));
    const prices = await Promise.all(promises);
    
    // Sort by market cap (based on predefined order in POPULAR_CRYPTOCURRENCIES)
    prices.sort((a, b) => {
      return POPULAR_CRYPTOCURRENCIES.indexOf(a.symbol) - POPULAR_CRYPTOCURRENCIES.indexOf(b.symbol);
    });
    
    res.json({
      prices,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

// Endpoint to get 24hr price statistics for a cryptocurrency
app.get('/api/stats/:symbol', rateLimiter, async (req, res) => {
  const symbol = req.params.symbol.toUpperCase() + 'USDT';
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    const {
      priceChange,
      priceChangePercent,
      weightedAvgPrice,
      highPrice,
      lowPrice,
      volume,
      lastPrice
    } = response.data;

    res.json({
      symbol,
      lastPrice: parseFloat(lastPrice),
      priceChange: parseFloat(priceChange),
      priceChangePercent: parseFloat(priceChangePercent),
      highPrice: parseFloat(highPrice),
      lowPrice: parseFloat(lowPrice),
      volume: parseFloat(volume),
      weightedAvgPrice: parseFloat(weightedAvgPrice),
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch statistics for ${symbol}` });
  }
});

// Endpoint to get cryptocurrency details
app.get('/api/crypto-details', rateLimiter, (req, res) => {
  try {
    const cryptoList = Object.entries(CRYPTO_DETAILS).map(([key, value]) => ({
      tradingPair: key,
      name: value.name,
      symbol: value.symbol,
      order: value.order
    }));

    // Sort by the predefined order
    cryptoList.sort((a, b) => a.order - b.order);

    res.json({
      cryptocurrencies: cryptoList,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cryptocurrency details' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});