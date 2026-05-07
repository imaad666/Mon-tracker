import { NextResponse } from 'next/server';
import { fetchMonadPrice, fetchHistoricalPrices, fetchTradingMetrics } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'price':
        const priceData = await fetchMonadPrice();
        return NextResponse.json(priceData);

      case 'historical':
        const days = parseInt(searchParams.get('days') || '7');
        const historicalData = await fetchHistoricalPrices(days);
        return NextResponse.json(historicalData);

      case 'metrics':
        const metricsData = await fetchTradingMetrics();
        return NextResponse.json(metricsData);

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
