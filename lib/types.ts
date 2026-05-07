export interface MonadPrice {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  usd_market_cap: number;
  last_updated_at: number;
}

export interface MonadMarketData {
  current_price: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
}

export interface MonadTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
}

export interface MonadBlock {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  miner: string;
  gasUsed: string;
  gasLimit: string;
}

export interface MonadNews {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface PriceAlert {
  id: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: number;
}

export interface PortfolioItem {
  amount: number;
  purchasePrice: number;
  purchaseDate: number;
}

export interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
}

export interface TradingMetrics {
  buyVolume24h: number;
  sellVolume24h: number;
  buyCount24h: number;
  sellCount24h: number;
  netFlow24h: number;
}

// Made with Bob
