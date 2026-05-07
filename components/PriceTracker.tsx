'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Sparkles, BarChart2, Activity } from 'lucide-react';
import { MonadMarketData } from '@/lib/types';
import { formatNumber } from '@/lib/api';

export default function PriceTracker() {
  const [marketData, setMarketData] = useState<MonadMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/monad?type=price');
        if (!response.ok) throw new Error('Failed to fetch price data');
        const data = await response.json();
        setMarketData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load price data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-8 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-8 bg-purple-500/20 rounded w-32"></div>
              <div className="h-4 bg-purple-500/20 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-10 bg-purple-500/20 rounded w-40"></div>
            <div className="h-6 bg-purple-500/20 rounded w-32"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-purple-500/20 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className="glass-card p-8 border-red-500/50">
        <div className="flex items-center gap-3 text-red-400">
          <Activity className="w-6 h-6" />
          <p className="font-semibold">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const isPositive = marketData.price_change_percentage_24h >= 0;

  return (
    <div className="glass-card p-8 relative overflow-hidden">
      {/* Animated Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isPositive ? 'from-green-500/10 to-emerald-500/5' : 'from-red-500/10 to-rose-500/5'} pointer-events-none`}></div>
      
      <div className="relative">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-4xl font-bold gradient-text">MONAD</h2>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Monad Cryptocurrency</p>
            </div>
          </div>
          
          <div className="text-left lg:text-right">
            <div className="text-5xl font-bold text-white mb-2">
              ${marketData.current_price.toFixed(6)}
            </div>
            <div className={`flex items-center gap-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
              <span className="text-2xl font-bold">
                {isPositive ? '+' : ''}{marketData.price_change_percentage_24h.toFixed(2)}%
              </span>
              <span className="text-gray-400 text-sm font-medium">24h</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card group">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              <p className="text-gray-400 text-sm font-medium">Market Cap</p>
            </div>
            <p className="text-white text-xl font-bold">{formatNumber(marketData.market_cap)}</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-purple-600 to-transparent rounded-full"></div>
          </div>
          
          <div className="stat-card group">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <p className="text-gray-400 text-sm font-medium">24h Volume</p>
            </div>
            <p className="text-white text-xl font-bold">{formatNumber(marketData.total_volume)}</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-blue-600 to-transparent rounded-full"></div>
          </div>
          
          <div className="stat-card group">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-gray-400 text-sm font-medium">24h High</p>
            </div>
            <p className="text-white text-xl font-bold">${marketData.high_24h.toFixed(6)}</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-green-600 to-transparent rounded-full"></div>
          </div>
          
          <div className="stat-card group">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <p className="text-gray-400 text-sm font-medium">24h Low</p>
            </div>
            <p className="text-white text-xl font-bold">${marketData.low_24h.toFixed(6)}</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-red-600 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Supply Information */}
        <div className="glass-card p-4 border border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">Circulating Supply</span>
              <span className="text-white font-bold">
                {marketData.circulating_supply.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">Total Supply</span>
              <span className="text-white font-bold">
                {marketData.total_supply?.toLocaleString() || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
