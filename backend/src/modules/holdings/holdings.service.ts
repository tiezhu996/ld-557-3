import { Injectable, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '../../types/request';
import { CreateHoldingDto } from './dto/create-holding.dto';
import { MarketService } from '../market/market.service';
import { PortfoliosService } from '../portfolios/portfolios.service';

export interface HoldingRecord {
  id: number;
  portfolioId: number;
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  pnl: number;
}

@Injectable()
export class HoldingsService {
  private readonly holdings: HoldingRecord[] = [
    { id: 1, portfolioId: 1, symbol: 'AAPL', quantity: 10, avgCost: 180, currentPrice: 195.2, pnl: 152 },
  ];
  private nextId = 2;

  constructor(
    private readonly marketService: MarketService,
    private readonly portfoliosService: PortfoliosService,
  ) {}

  listByPortfolio(portfolioId: number, user: CurrentUser) {
    this.portfoliosService.findOwned(portfolioId, user);
    return this.revalueAll(this.holdings.filter((item) => item.portfolioId === portfolioId));
  }

  findOwned(id: number, user: CurrentUser) {
    const holding = this.holdings.find((item) => item.id === id);
    if (!holding) throw new NotFoundException('holding not found');
    this.portfoliosService.findOwned(holding.portfolioId, user);
    return this.revalue(holding);
  }

  create(portfolioId: number, dto: CreateHoldingDto, user: CurrentUser) {
    this.portfoliosService.findOwned(portfolioId, user);
    const currentPrice = this.marketService.currentPrice(dto.symbol);
    const holding: HoldingRecord = {
      id: this.nextId++,
      portfolioId,
      symbol: dto.symbol.toUpperCase(),
      quantity: dto.quantity,
      avgCost: dto.avgCost,
      currentPrice,
      pnl: (currentPrice - dto.avgCost) * dto.quantity,
    };
    this.holdings.push(holding);
    this.recomputePortfolioValue(portfolioId);
    return holding;
  }

  delete(id: number, user: CurrentUser) {
    const holding = this.findOwned(id, user);
    const index = this.holdings.findIndex((item) => item.id === id);
    this.holdings.splice(index, 1);
    this.recomputePortfolioValue(holding.portfolioId);
    return { deleted: true, id };
  }

  applyTransaction(holdingId: number, quantity: number, price: number, type: 'BUY' | 'SELL' | 'DIVIDEND', user: CurrentUser) {
    const holding = this.findOwned(holdingId, user);
    if (type === 'BUY') {
      const newQuantity = holding.quantity + quantity;
      holding.avgCost = ((holding.avgCost * holding.quantity) + (price * quantity)) / newQuantity;
      holding.quantity = newQuantity;
    }
    if (type === 'SELL') {
      holding.quantity = Math.max(0, holding.quantity - quantity);
    }
    this.revalue(holding);
    this.recomputePortfolioValue(holding.portfolioId);
    return holding;
  }

  private revalueAll(items: HoldingRecord[]) {
    return items.map((item) => this.revalue(item));
  }

  private revalue(holding: HoldingRecord) {
    holding.currentPrice = this.marketService.currentPrice(holding.symbol);
    holding.pnl = Number(((holding.currentPrice - holding.avgCost) * holding.quantity).toFixed(2));
    return holding;
  }

  private recomputePortfolioValue(portfolioId: number) {
    const total = this.revalueAll(this.holdings.filter((item) => item.portfolioId === portfolioId))
      .reduce((sum, item) => sum + item.currentPrice * item.quantity, 0);
    this.portfoliosService.setTotalValue(portfolioId, total);
  }
}

