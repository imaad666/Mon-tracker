'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-6 shadow-xl animate-pulse">
        <div className="h-8 bg-purple-700 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-purple-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className="bg-red-900/50 rounded-lg p-6 shadow-xl">
        <p className="text-red-200">{error || 'No data available'}</p>
      </div>
    );
  }

  const isPositive = marketData.price_change_percentage_24h >= 0;

  return (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-6 shadow-xl border border-purple-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-700 p-3 rounded-full">
            <DollarSign className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">MONAD</h2>
            <p className="text-purple-300 text-sm">Monad Token</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">
            ${marketData.current_price.toFixed(2)}
          </div>
          <div className={`flex items-center gap-1 justify-end ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-semibold">
              {isPositive ? '+' : ''}{marketData.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-purple-800/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm mb-1">Market Cap</p>
          <p className="text-white font-semibold">{formatNumber(marketData.market_cap)}</p>
        </div>
        <div className="bg-purple-800/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm mb-1">24h Volume</p>
          <p className="text-white font-semibold">{formatNumber(marketData.total_volume)}</p>
        </div>
        <div className="bg-purple-800/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm mb-1">24h High</p>
          <p className="text-white font-semibold">${marketData.high_24h.toFixed(2)}</p>
        </div>
        <div className="bg-purple-800/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm mb-1">24h Low</p>
          <p className="text-white font-semibold">${marketData.low_24h.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-purple-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-purple-300">Circulating Supply:</span>
            <span className="text-white ml-2 font-medium">
              {marketData.circulating_supply.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-purple-300">Total Supply:</span>
            <span className="text-white ml-2 font-medium">
              {marketData.total_supply?.toLocaleString() || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
