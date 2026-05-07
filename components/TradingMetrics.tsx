'use client';

import { useEffect, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Activity, TrendingUp } from 'lucide-react';
import { TradingMetrics as TradingMetricsType } from '@/lib/types';
import { formatNumber } from '@/lib/api';

export default function TradingMetrics() {
  const [metrics, setMetrics] = useState<TradingMetricsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/monad?type=metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching trading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <p className="text-gray-400">No trading data available</p>
      </div>
    );
  }

  const buyPercentage = (metrics.buyVolume24h / (metrics.buyVolume24h + metrics.sellVolume24h)) * 100;
  const sellPercentage = 100 - buyPercentage;
  const isNetPositive = metrics.netFlow24h > 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-400" />
        <h3 className="text-xl font-bold text-white">24h Trading Metrics</h3>
      </div>

      <div className="space-y-4">
        {/* Buy Volume */}
        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Buy Volume</span>
            </div>
            <span className="text-white font-bold">{formatNumber(metrics.buyVolume24h)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{metrics.buyCount24h.toLocaleString()} transactions</span>
            <span className="text-green-400 font-medium">{buyPercentage.toFixed(1)}%</span>
          </div>
          <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-500"
              style={{ width: `${buyPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Sell Volume */}
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-semibold">Sell Volume</span>
            </div>
            <span className="text-white font-bold">{formatNumber(metrics.sellVolume24h)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{metrics.sellCount24h.toLocaleString()} transactions</span>
            <span className="text-red-400 font-medium">{sellPercentage.toFixed(1)}%</span>
          </div>
          <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-red-500 h-full transition-all duration-500"
              style={{ width: `${sellPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Net Flow */}
        <div className={`${isNetPositive ? 'bg-green-900/20 border-green-700/50' : 'bg-red-900/20 border-red-700/50'} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${isNetPositive ? 'text-green-400' : 'text-red-400'}`} />
              <span className="text-white font-semibold">Net Flow (24h)</span>
            </div>
            <span className={`font-bold text-lg ${isNetPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isNetPositive ? '+' : ''}{formatNumber(metrics.netFlow24h)}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {isNetPositive ? 'More buying pressure' : 'More selling pressure'} in the last 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
