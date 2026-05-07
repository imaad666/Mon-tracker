'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ChartDataPoint } from '@/lib/types';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeFrame = '1' | '7' | '30' | '90';

export default function PriceChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('7');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/monad?type=historical&days=${timeFrame}`);
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [timeFrame]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeFrame === '1') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate price change
  const priceChange = chartData.length > 1 
    ? ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price) * 100
    : 0;
  const isPositive = priceChange >= 0;

  const chartConfig = {
    labels: chartData.map(d => formatDate(d.timestamp)),
    datasets: [
      {
        label: 'Price (USD)',
        data: chartData.map(d => d.price),
        borderColor: isPositive 
          ? 'rgba(34, 197, 94, 1)' 
          : 'rgba(239, 68, 68, 1)',
        backgroundColor: isPositive
          ? 'rgba(34, 197, 94, 0.1)'
          : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 3,
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        borderWidth: 2,
        padding: 16,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 16,
          weight: 'bold' as const,
        },
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toFixed(6)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          maxTicksLimit: 8,
          font: {
            size: 11,
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: function(value: any) {
            return '$' + value.toFixed(6);
          },
          font: {
            size: 11,
          }
        },
        border: {
          display: false,
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const timeFrames: { value: TimeFrame; label: string }[] = [
    { value: '1', label: '24H' },
    { value: '7', label: '7D' },
    { value: '30', label: '30D' },
    { value: '90', label: '90D' },
  ];

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Price Chart</h3>
          </div>
          {chartData.length > 0 && (
            <div className="flex items-center gap-2 ml-11">
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
              <span className="text-gray-400 text-sm">
                {timeFrame === '1' ? 'Last 24 hours' : `Last ${timeFrame} days`}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {timeFrames.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeFrame(value)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                timeFrame === value
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                  : 'glass-card text-gray-300 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-96 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-500/20"></div>
            </div>
            <p className="text-gray-400 font-medium">Loading chart data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-full relative">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent rounded-xl pointer-events-none"></div>
            <Line data={chartConfig} options={options} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <Activity className="w-12 h-12 opacity-50" />
            <p className="font-medium">No chart data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
