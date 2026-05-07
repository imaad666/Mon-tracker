'use client';

import { useEffect, useState } from 'react';
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PortfolioItem } from '@/lib/types';

export default function PortfolioTracker() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  useEffect(() => {
    // Load portfolio from localStorage
    const saved = localStorage.getItem('monad_portfolio');
    if (saved) {
      setPortfolio(JSON.parse(saved));
    }

    // Fetch current price
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/monad?type=price');
        const data = await response.json();
        if (data && data.current_price) {
          setCurrentPrice(data.current_price);
        }
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);

    return () => clearInterval(interval);
  }, []);

  const savePortfolio = (newPortfolio: PortfolioItem[]) => {
    setPortfolio(newPortfolio);
    localStorage.setItem('monad_portfolio', JSON.stringify(newPortfolio));
  };

  const addToPortfolio = () => {
    if (!amount || !purchasePrice) return;

    const newItem: PortfolioItem = {
      amount: parseFloat(amount),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate: Date.now(),
    };

    savePortfolio([...portfolio, newItem]);
    setAmount('');
    setPurchasePrice('');
    setShowAddForm(false);
  };

  const removeFromPortfolio = (index: number) => {
    const newPortfolio = portfolio.filter((_, i) => i !== index);
    savePortfolio(newPortfolio);
  };

  const calculateStats = () => {
    const totalAmount = portfolio.reduce((sum, item) => sum + item.amount, 0);
    const totalInvested = portfolio.reduce((sum, item) => sum + (item.amount * item.purchasePrice), 0);
    const currentValue = totalAmount * currentPrice;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      totalAmount,
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercentage,
    };
  };

  const stats = calculateStats();
  const isProfit = stats.profitLoss >= 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-bold text-white">Portfolio Tracker</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Position
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-white font-semibold mb-4">Add New Position</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Amount (MONAD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Purchase Price (USD)</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addToPortfolio}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded-lg py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {portfolio.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Holdings</p>
              <p className="text-white font-bold text-lg">{stats.totalAmount.toFixed(4)} MONAD</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Invested</p>
              <p className="text-white font-bold text-lg">${stats.totalInvested.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Current Value</p>
              <p className="text-white font-bold text-lg">${stats.currentValue.toFixed(2)}</p>
            </div>
            <div className={`${isProfit ? 'bg-green-900/30' : 'bg-red-900/30'} rounded-lg p-4`}>
              <p className="text-gray-400 text-sm mb-1">Profit/Loss</p>
              <div className="flex items-center gap-2">
                {isProfit ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <div>
                  <p className={`font-bold text-lg ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}{stats.profitLoss.toFixed(2)}
                  </p>
                  <p className={`text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}{stats.profitLossPercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {portfolio.map((item, index) => {
              const currentValue = item.amount * currentPrice;
              const invested = item.amount * item.purchasePrice;
              const profit = currentValue - invested;
              const profitPercentage = (profit / invested) * 100;
              const itemIsProfit = profit >= 0;

              return (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold">{item.amount.toFixed(4)} MONAD</p>
                      <p className="text-gray-400 text-sm">
                        Bought at ${item.purchasePrice.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromPortfolio(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-400">Current: </span>
                      <span className="text-white font-medium">${currentValue.toFixed(2)}</span>
                    </div>
                    <div className={itemIsProfit ? 'text-green-400' : 'text-red-400'}>
                      {itemIsProfit ? '+' : ''}{profit.toFixed(2)} ({itemIsProfit ? '+' : ''}{profitPercentage.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400 py-12">
          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No positions added yet</p>
          <p className="text-sm mt-2">Click "Add Position" to start tracking your portfolio</p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
