import axios from 'axios';
import { MonadMarketData } from './types';

const CMC_API_KEY = process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY;
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

// CoinMarketCap API implementation for Monad
export async function fetchMonadPriceFromCMC(): Promise<MonadMarketData | null> {
  if (!CMC_API_KEY) {
    console.error('CoinMarketCap API key not found');
    return null;
  }

  try {
    // Get Monad cryptocurrency data
    const response = await axios.get(`${CMC_BASE_URL}/cryptocurrency/quotes/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json',
      },
      params: {
        symbol: 'MONAD',
        convert: 'USD',
      },
    });

    if (response.data && response.data.data && response.data.data.MONAD) {
      const monadData = response.data.data.MONAD[0];
      const quote = monadData.quote.USD;

      return {
        current_price: quote.price,
        market_cap: quote.market_cap || 0,
        total_volume: quote.volume_24h || 0,
        high_24h: quote.price * 1.05, // Approximate
        low_24h: quote.price * 0.95, // Approximate
        price_change_24h: quote.price * (quote.percent_change_24h / 100),
        price_change_percentage_24h: quote.percent_change_24h,
        market_cap_change_24h: 0,
        market_cap_change_percentage_24h: 0,
        circulating_supply: monadData.circulating_supply || 0,
        total_supply: monadData.total_supply || 0,
        max_supply: monadData.max_supply || 0,
        ath: quote.price, // Would need historical data
        ath_change_percentage: 0,
        ath_date: new Date().toISOString(),
        atl: quote.price,
        atl_change_percentage: 0,
        atl_date: new Date().toISOString(),
      };
    }

    return null;
  } catch (error: any) {
    console.error('Error fetching from CoinMarketCap:', error.response?.data || error.message);
    return null;
  }
}

// Get cryptocurrency map to find Monad ID
export async function getMonadCMCId(): Promise<number | null> {
  if (!CMC_API_KEY) {
    return null;
  }

  try {
    const response = await axios.get(`${CMC_BASE_URL}/cryptocurrency/map`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
      },
      params: {
        symbol: 'MONAD',
      },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error getting Monad CMC ID:', error);
    return null;
  }
}

// Made with Bob
