import axios from 'axios';
import { CRYPTO_DETAILS, POPULAR_CRYPTOCURRENCIES } from '../constants/cryptocurrencies.js';

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

// Price API routes
export const setupPriceRoutes = (app, rateLimiter) => {
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
};
