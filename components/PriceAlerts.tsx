'use client';

import { useEffect, useState } from 'react';
import { Bell, Plus, Trash2, Check, X } from 'lucide-react';
import { PriceAlert } from '@/lib/types';

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  useEffect(() => {
    // Load alerts from localStorage
    const saved = localStorage.getItem('monad_alerts');
    if (saved) {
      setAlerts(JSON.parse(saved));
    }

    // Fetch current price and check alerts
    const checkAlerts = async () => {
      try {
        const response = await fetch('/api/monad?type=price');
        const data = await response.json();
        if (data && data.current_price) {
          setCurrentPrice(data.current_price);
          checkTriggeredAlerts(data.current_price);
        }
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 30000);

    return () => clearInterval(interval);
  }, [alerts]);

  const checkTriggeredAlerts = (price: number) => {
    const saved = localStorage.getItem('monad_alerts');
    if (!saved) return;

    const currentAlerts: PriceAlert[] = JSON.parse(saved);
    const triggeredAlerts = currentAlerts.filter(alert => {
      if (!alert.isActive) return false;
      if (alert.condition === 'above' && price >= alert.targetPrice) return true;
      if (alert.condition === 'below' && price <= alert.targetPrice) return true;
      return false;
    });

    if (triggeredAlerts.length > 0) {
      triggeredAlerts.forEach(alert => {
        if (Notification.permission === 'granted') {
          new Notification('Monad Price Alert', {
            body: `Price is ${alert.condition} $${alert.targetPrice}. Current: $${price.toFixed(2)}`,
            icon: '/favicon.ico',
          });
        }
      });

      // Deactivate triggered alerts
      const updatedAlerts = currentAlerts.map(alert => {
        if (triggeredAlerts.find(t => t.id === alert.id)) {
          return { ...alert, isActive: false };
        }
        return alert;
      });
      saveAlerts(updatedAlerts);
    }
  };

  const saveAlerts = (newAlerts: PriceAlert[]) => {
    setAlerts(newAlerts);
    localStorage.setItem('monad_alerts', JSON.stringify(newAlerts));
  };

  const addAlert = () => {
    if (!targetPrice) return;

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      targetPrice: parseFloat(targetPrice),
      condition,
      isActive: true,
      createdAt: Date.now(),
    };

    saveAlerts([...alerts, newAlert]);
    setTargetPrice('');
    setShowAddForm(false);
  };

  const removeAlert = (id: string) => {
    const newAlerts = alerts.filter(alert => alert.id !== id);
    saveAlerts(newAlerts);
  };

  const toggleAlert = (id: string) => {
    const newAlerts = alerts.map(alert =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    );
    saveAlerts(newAlerts);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Price Alerts</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Alert
        </button>
      </div>

      {currentPrice > 0 && (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <p className="text-gray-400 text-sm mb-1">Current Price</p>
          <p className="text-white font-bold text-2xl">${currentPrice.toFixed(2)}</p>
        </div>
      )}

      {showAddForm && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="text-white font-semibold mb-4">Create New Alert</h4>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Condition</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCondition('above')}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    condition === 'above'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Price Above
                </button>
                <button
                  onClick={() => setCondition('below')}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    condition === 'below'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Price Below
                </button>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Target Price (USD)</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addAlert}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg py-2 transition-colors"
              >
                Create Alert
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded-lg py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {alerts.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg p-4 ${
                alert.isActive
                  ? 'bg-gray-700/50 border border-gray-600'
                  : 'bg-gray-700/30 border border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        alert.condition === 'above'
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-red-900/50 text-red-400'
                      }`}
                    >
                      {alert.condition === 'above' ? '↑ Above' : '↓ Below'}
                    </span>
                    <span className="text-white font-bold text-lg">
                      ${alert.targetPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {alert.isActive ? 'Active' : 'Triggered'} • Created {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      alert.isActive
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    }`}
                    title={alert.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {alert.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-12">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No price alerts set</p>
          <p className="text-sm mt-2">Create an alert to get notified when price reaches your target</p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
