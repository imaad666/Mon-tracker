'use client';

import PriceTracker from '@/components/PriceTracker';
import PriceChart from '@/components/PriceChart';
import { TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-2.5 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Monad Tracker</h1>
                <p className="text-sm text-gray-500">Cryptocurrency Price Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live</span>
              </div>
              <div className="hidden lg:block text-sm text-gray-500">
                Powered by <span className="font-semibold text-purple-600">CoinMarketCap</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Price Tracker */}
          <section>
            <PriceTracker />
          </section>

          {/* Price Chart */}
          <section>
            <PriceChart />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-900 font-semibold">Monad Tracker</p>
              <p className="text-gray-500 text-sm">
                Real-time cryptocurrency data powered by CoinMarketCap API
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a 
                href="https://coinmarketcap.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
              >
                CoinMarketCap
              </a>
              <a 
                href="https://monad.xyz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
              >
                Monad
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-gray-400 text-xs">
              Data updates every 30 seconds • Not financial advice • For informational purposes only
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Made with Bob
