'use client';

import PriceTracker from '@/components/PriceTracker';
import TradingMetrics from '@/components/TradingMetrics';
import PriceChart from '@/components/PriceChart';
import BlockchainExplorer from '@/components/BlockchainExplorer';
import NewsFeed from '@/components/NewsFeed';
import PortfolioTracker from '@/components/PortfolioTracker';
import PriceAlerts from '@/components/PriceAlerts';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Monad Tracker</h1>
                <p className="text-sm text-gray-400">Real-time Cryptocurrency Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Price Tracker - Full Width */}
          <section>
            <PriceTracker />
          </section>

          {/* Trading Metrics and Price Chart */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TradingMetrics />
            </div>
            <div className="lg:col-span-2">
              <PriceChart />
            </div>
          </section>

          {/* Portfolio and Alerts */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PortfolioTracker />
            <PriceAlerts />
          </section>

          {/* Blockchain Explorer and News */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BlockchainExplorer />
            <NewsFeed />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              <p>© 2026 Monad Tracker. Real-time cryptocurrency monitoring platform.</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-purple-400 transition-colors">About</a>
              <a href="#" className="hover:text-purple-400 transition-colors">API</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Made with Bob
