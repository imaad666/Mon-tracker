'use client';

import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import { MonadNews } from '@/lib/types';
import { fetchMonadNews } from '@/lib/api';

export default function NewsFeed() {
  const [news, setNews] = useState<MonadNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const newsData = await fetchMonadNews();
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <Newspaper className="w-5 h-5 text-orange-400" />
        <h3 className="text-xl font-bold text-white">Latest News</h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-600 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : news.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {news.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2 group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.publishedAt)}
                    </span>
                    <span className="text-orange-400">{item.source}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-400 transition-colors flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          No news available at the moment
        </div>
      )}
    </div>
  );
}

// Made with Bob
