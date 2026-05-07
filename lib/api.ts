import axios from 'axios';
import { MonadMarketData, MonadNews, MonadTransaction, MonadBlock, TradingMetrics, ChartDataPoint } from './types';
import { fetchMonadPriceFromCMC } from './coinmarketcap';

const COINMARKETCAP_API_KEY = process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY;

// Use CoinMarketCap exclusively
export async function fetchMonadPrice(): Promise<MonadMarketData | null> {
  try {
    return await fetchMonadPriceFromCMC();
  } catch (error) {
    console.error('Error fetching Monad price from CoinMarketCap:', error);
    return null;
  }
}

export async function fetchHistoricalPrices(days: number = 7): Promise<ChartDataPoint[]> {
  try {
    // Generate mock historical data based on current price
    const currentData = await fetchMonadPrice();
    if (!currentData) return [];
    
    const basePrice = currentData.current_price;
    const dataPoints: ChartDataPoint[] = [];
    const now = Date.now();
    const interval = days === 1 ? 3600000 : 86400000; // 1 hour or 1 day
    const numPoints = days === 1 ? 24 : days;
    
    for (let i = numPoints; i >= 0; i--) {
      const timestamp = now - (i * interval);
      const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + randomVariation);
      const volume = currentData.total_volume * (0.8 + Math.random() * 0.4); // 80-120% of current volume
      
      dataPoints.push({
        timestamp,
        price,
        volume,
      });
    }
    
    return dataPoints;
  } catch (error) {
    console.error('Error generating historical prices:', error);
    return [];
  }
}

export async function fetchMonadNews(): Promise<MonadNews[]> {
  try {
    // Using a news API - replace with actual implementation
    // For now, returning mock data
    return [
      {
        title: 'Monad Blockchain Announces Major Partnership',
        description: 'Monad partners with leading DeFi protocols to expand ecosystem',
        url: '#',
        source: 'Crypto News',
        publishedAt: new Date().toISOString(),
        imageUrl: '/placeholder-news.jpg',
      },
      {
        title: 'Monad TVL Reaches New All-Time High',
        description: 'Total Value Locked in Monad ecosystem surpasses $1B milestone',
        url: '#',
        source: 'DeFi Pulse',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        title: 'New DEX Launches on Monad Network',
        description: 'Revolutionary decentralized exchange goes live with innovative features',
        url: '#',
        source: 'Blockchain Today',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  } catch (error) {
    console.error('Error fetching Monad news:', error);
    return [];
  }
}

export async function fetchRecentTransactions(): Promise<MonadTransaction[]> {
  try {
    // Mock data - replace with actual Monad blockchain explorer API
    const mockTransactions: MonadTransaction[] = Array.from({ length: 10 }, (_, i) => ({
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      from: `0x${Math.random().toString(16).substr(2, 40)}`,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      value: (Math.random() * 1000).toFixed(4),
      timestamp: Date.now() - i * 60000,
      blockNumber: 1000000 - i,
      gasUsed: (Math.random() * 100000).toFixed(0),
      gasPrice: (Math.random() * 50).toFixed(2),
    }));
    return mockTransactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function fetchRecentBlocks(): Promise<MonadBlock[]> {
  try {
    // Mock data - replace with actual Monad blockchain explorer API
    const mockBlocks: MonadBlock[] = Array.from({ length: 10 }, (_, i) => ({
      number: 1000000 - i,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: Date.now() - i * 12000,
      transactions: Math.floor(Math.random() * 200),
      miner: `0x${Math.random().toString(16).substr(2, 40)}`,
      gasUsed: (Math.random() * 10000000).toFixed(0),
      gasLimit: '15000000',
    }));
    return mockBlocks;
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return [];
  }
}

export async function fetchTradingMetrics(): Promise<TradingMetrics> {
  try {
    // Mock data - replace with actual trading data API
    const buyVolume = Math.random() * 10000000;
    const sellVolume = Math.random() * 10000000;
    
    return {
      buyVolume24h: buyVolume,
      sellVolume24h: sellVolume,
      buyCount24h: Math.floor(Math.random() * 5000),
      sellCount24h: Math.floor(Math.random() * 5000),
      netFlow24h: buyVolume - sellVolume,
    };
  } catch (error) {
    console.error('Error fetching trading metrics:', error);
    return {
      buyVolume24h: 0,
      sellVolume24h: 0,
      buyCount24h: 0,
      sellCount24h: 0,
      netFlow24h: 0,
    };
  }
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(decimals)}B`;
  }
  if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(decimals)}M`;
  }
  if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(decimals)}K`;
  }
  return `$${num.toFixed(decimals)}`;
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Made with Bob
