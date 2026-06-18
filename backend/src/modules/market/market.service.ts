import { Injectable, NotFoundException } from '@nestjs/common';
import { AssetStatus } from '../../constants/enums';

interface Quote {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  status: AssetStatus;
  updatedAt: string;
}

@Injectable()
export class MarketService {
  private readonly quotes: Quote[] = [
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: 195.2, change: 1.4, changePercent: 0.72, volume: 52000000, marketCap: 3000000000000, status: AssetStatus.ACTIVE, updatedAt: new Date().toISOString() },
    { id: 2, symbol: 'BTC', name: 'Bitcoin', price: 103500, change: -890, changePercent: -0.85, volume: 12000000000, marketCap: 2040000000000, status: AssetStatus.ACTIVE, updatedAt: new Date().toISOString() },
    { id: 3, symbol: 'VOO', name: 'Vanguard S&P 500 ETF', price: 512.44, change: 2.12, changePercent: 0.42, volume: 4100000, marketCap: 0, status: AssetStatus.ACTIVE, updatedAt: new Date().toISOString() },
  ];

  quote(symbol: string) {
    const quote = this.quotes.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase());
    if (!quote) throw new NotFoundException('asset not found');
    return { ...quote, cacheTtlSeconds: 60 };
  }

  search(keyword = '') {
    const q = keyword.toLowerCase();
    return {
      cacheTtlSeconds: 600,
      items: this.quotes.filter((item) => item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)),
    };
  }

  history(symbol: string, period = '1m') {
    const quote = this.quote(symbol);
    const points = Array.from({ length: 12 }, (_, index) => ({
      date: `2026-${String(index + 1).padStart(2, '0')}-01`,
      open: Number((quote.price * (0.92 + index * 0.01)).toFixed(2)),
      close: Number((quote.price * (0.94 + index * 0.008)).toFixed(2)),
      high: Number((quote.price * (0.96 + index * 0.008)).toFixed(2)),
      low: Number((quote.price * (0.9 + index * 0.008)).toFixed(2)),
    }));
    return { symbol: quote.symbol, period, cacheTtlSeconds: 300, points };
  }

  trending() {
    return this.quotes.slice().sort((a, b) => b.volume - a.volume);
  }

  currentPrice(symbol: string) {
    return this.quote(symbol).price;
  }
}

