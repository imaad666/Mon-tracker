'use client';

import { useEffect, useState } from 'react';
import { Blocks, ArrowRightLeft, ExternalLink } from 'lucide-react';
import { MonadTransaction, MonadBlock } from '@/lib/types';
import { fetchRecentTransactions, fetchRecentBlocks, formatAddress, formatTimeAgo } from '@/lib/api';

type TabType = 'transactions' | 'blocks';

export default function BlockchainExplorer() {
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [transactions, setTransactions] = useState<MonadTransaction[]>([]);
  const [blocks, setBlocks] = useState<MonadBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [txData, blockData] = await Promise.all([
          fetchRecentTransactions(),
          fetchRecentBlocks(),
        ]);
        setTransactions(txData);
        setBlocks(blockData);
      } catch (error) {
        console.error('Error fetching blockchain data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <Blocks className="w-5 h-5 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Blockchain Explorer</h3>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'transactions'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'blocks'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Blocks className="w-4 h-4" />
          Blocks
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activeTab === 'transactions' ? (
            transactions.length > 0 ? (
              transactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-mono text-sm">
                          {formatAddress(tx.hash)}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {formatTimeAgo(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">From:</span>
                      <span className="text-white ml-2 font-mono">{formatAddress(tx.from)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">To:</span>
                      <span className="text-white ml-2 font-mono">{formatAddress(tx.to)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Value:</span>
                      <span className="text-green-400 ml-2 font-semibold">{tx.value} MONAD</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Block:</span>
                      <span className="text-white ml-2">#{tx.blockNumber}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">No transactions found</div>
            )
          ) : (
            blocks.length > 0 ? (
              blocks.map((block) => (
                <div
                  key={block.hash}
                  className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Blocks className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">Block #{block.number}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {formatTimeAgo(block.timestamp)}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Transactions:</span>
                      <span className="text-white ml-2 font-semibold">{block.transactions}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Miner:</span>
                      <span className="text-white ml-2 font-mono">{formatAddress(block.miner)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Gas Used:</span>
                      <span className="text-white ml-2">{parseInt(block.gasUsed).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Gas Limit:</span>
                      <span className="text-white ml-2">{parseInt(block.gasLimit).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">No blocks found</div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// Made with Bob
