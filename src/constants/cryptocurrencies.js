// Popular cryptocurrencies with their details
export const CRYPTO_DETAILS = {
  'BTCUSDT': {
    name: 'Bitcoin',
    symbol: 'BTC',
    order: 1
  },
  'ETHUSDT': {
    name: 'Ethereum',
    symbol: 'ETH',
    order: 2
  },
  'DOGEUSDT': {
    name: 'Dogecoin',
    symbol: 'DOGE',
    order: 3
  },
  'BNBUSDT': {
    name: 'Binance Coin',
    symbol: 'BNB',
    order: 4
  },
  'ADAUSDT': {
    name: 'Cardano',
    symbol: 'ADA',
    order: 5
  },
  'XRPUSDT': {
    name: 'Ripple',
    symbol: 'XRP',
    order: 6
  },
  'SOLUSDT': {
    name: 'Solana',
    symbol: 'SOL',
    order: 7
  },
  'DOTUSDT': {
    name: 'Polkadot',
    symbol: 'DOT',
    order: 8
  },
  'MATICUSDT': {
    name: 'Polygon',
    symbol: 'MATIC',
    order: 9
  },
  'AVAXUSDT': {
    name: 'Avalanche',
    symbol: 'AVAX',
    order: 10
  }
};

// List of active cryptocurrency trading pairs
export const POPULAR_CRYPTOCURRENCIES = Object.keys(CRYPTO_DETAILS);

// Helper functions
export const getCryptoName = (tradingPair) => CRYPTO_DETAILS[tradingPair]?.name;
export const getCryptoSymbol = (tradingPair) => CRYPTO_DETAILS[tradingPair]?.symbol;
export const getCryptoOrder = (tradingPair) => CRYPTO_DETAILS[tradingPair]?.order;