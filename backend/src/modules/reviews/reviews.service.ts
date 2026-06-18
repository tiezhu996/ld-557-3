import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionType } from '../../constants/enums';
import { CurrentUser } from '../../types/request';
import { parsePeriod } from '../../utils/period';
import { HoldingsService, HoldingRecord } from '../holdings/holdings.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { TransactionRecord, TransactionsService } from '../transactions/transactions.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

interface ReviewRecord {
  id: number;
  portfolioId: number;
  period: string;
  summary: string;
  decisions: Array<Record<string, unknown>>;
  lessons: string;
  createdAt: string;
}

@Injectable()
export class ReviewsService {
  private readonly reviews: ReviewRecord[] = [];
  private nextId = 1;

  constructor(
    private readonly portfoliosService: PortfoliosService,
    private readonly transactionsService: TransactionsService,
    private readonly holdingsService: HoldingsService,
  ) {}

  list(portfolioId: number, user: CurrentUser) {
    this.portfoliosService.findOwned(portfolioId, user);
    return this.reviews.filter((item) => item.portfolioId === portfolioId);
  }

  create(portfolioId: number, dto: CreateReviewDto, user: CurrentUser) {
    this.portfoliosService.findOwned(portfolioId, user);
    const review: ReviewRecord = {
      id: this.nextId++,
      portfolioId,
      period: dto.period,
      summary: dto.summary,
      decisions: dto.decisions ?? [],
      lessons: dto.lessons ?? '',
      createdAt: new Date().toISOString(),
    };
    this.reviews.push(review);
    return review;
  }

  async generateDraft(portfolioId: number, period: string, user: CurrentUser) {
    this.portfoliosService.findOwned(portfolioId, user);
    const periodRange = parsePeriod(period);
    const portfolio = this.portfoliosService.findOwned(portfolioId, user);
    const holdings = this.holdingsService.listByPortfolio(portfolioId, user);
    const transactions = this.transactionsService.listByPortfolioAndPeriod(
      portfolioId,
      periodRange.start,
      periodRange.end,
      user,
    );

    const stats = this.calculateTransactionStats(transactions);
    const periodHoldings = this.estimatePeriodHoldings(holdings, transactions);
    const returns = this.calculateReturns(portfolio, periodHoldings, stats, holdings);

    const summary = this.generateSummary(periodRange.label, stats, returns, holdings);
    const decisions = this.generateDecisions(transactions, holdings);
    const lessons = this.generateLessons(stats, returns);

    return {
      period,
      periodLabel: periodRange.label,
      summary,
      decisions,
      lessons,
      stats: {
        totalTransactions: transactions.length,
        buyCount: stats.buyCount,
        sellCount: stats.sellCount,
        dividendCount: stats.dividendCount,
        totalBuyAmount: stats.totalBuyAmount,
        totalSellAmount: stats.totalSellAmount,
        totalFee: stats.totalFee,
        dividendIncome: stats.dividendIncome,
      },
      returns: {
        periodReturn: returns.periodReturn,
        periodReturnPercent: returns.periodReturnPercent,
        startValue: returns.startValue,
        endValue: returns.endValue,
        netInvestment: returns.netInvestment,
      },
      holdings: holdings.map((h) => ({
        symbol: h.symbol,
        quantity: h.quantity,
        avgCost: h.avgCost,
        currentPrice: h.currentPrice,
        pnl: h.pnl,
        pnlPercent: Number(((h.pnl / (h.avgCost * h.quantity)) * 100).toFixed(2)),
      })),
    };
  }

  private calculateTransactionStats(transactions: TransactionRecord[]) {
    let buyCount = 0;
    let sellCount = 0;
    let dividendCount = 0;
    let totalBuyAmount = 0;
    let totalSellAmount = 0;
    let totalFee = 0;
    let dividendIncome = 0;

    for (const tx of transactions) {
      const amount = tx.quantity * tx.price;
      if (tx.type === TransactionType.BUY) {
        buyCount++;
        totalBuyAmount += amount;
        totalFee += tx.fee;
      } else if (tx.type === TransactionType.SELL) {
        sellCount++;
        totalSellAmount += amount;
        totalFee += tx.fee;
      } else if (tx.type === TransactionType.DIVIDEND) {
        dividendCount++;
        dividendIncome += amount;
      }
    }

    return {
      buyCount,
      sellCount,
      dividendCount,
      totalBuyAmount: Number(totalBuyAmount.toFixed(2)),
      totalSellAmount: Number(totalSellAmount.toFixed(2)),
      totalFee: Number(totalFee.toFixed(2)),
      dividendIncome: Number(dividendIncome.toFixed(2)),
      netInvestment: Number((totalBuyAmount - totalSellAmount).toFixed(2)),
    };
  }

  private estimatePeriodHoldings(
    currentHoldings: HoldingRecord[],
    transactions: TransactionRecord[],
  ) {
    const holdingsMap = new Map<string, { quantity: number; avgCost: number }>();

    for (const h of currentHoldings) {
      holdingsMap.set(h.symbol, { quantity: h.quantity, avgCost: h.avgCost });
    }

    const sortedTxs = [...transactions].sort(
      (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime(),
    );

    for (const tx of sortedTxs) {
      const holding = currentHoldings.find((h) => h.id === tx.holdingId);
      if (!holding) continue;

      const symbol = holding.symbol;
      const state = holdingsMap.get(symbol);
      if (!state) continue;

      if (tx.type === TransactionType.BUY) {
        const newQuantity = state.quantity - tx.quantity;
        if (newQuantity > 0) {
          state.avgCost = ((state.avgCost * state.quantity) - (tx.price * tx.quantity)) / newQuantity;
        }
        state.quantity = Math.max(0, newQuantity);
      } else if (tx.type === TransactionType.SELL) {
        state.quantity = state.quantity + tx.quantity;
      }
    }

    return holdingsMap;
  }

  private calculateReturns(
    portfolio: { totalValue: number },
    periodHoldings: Map<string, { quantity: number; avgCost: number }>,
    stats: ReturnType<typeof this.calculateTransactionStats>,
    currentHoldings: HoldingRecord[],
  ) {
    const endValue = portfolio.totalValue;

    let startValue = 0;
    for (const holding of currentHoldings) {
      const periodState = periodHoldings.get(holding.symbol);
      if (periodState && periodState.quantity > 0) {
        startValue += periodState.quantity * periodState.avgCost;
      }
    }

    const netInvestment = stats.netInvestment;
    const periodReturn = endValue - startValue - netInvestment + stats.dividendIncome;
    const periodReturnPercent = startValue > 0
      ? Number(((periodReturn / startValue) * 100).toFixed(2))
      : 0;

    return {
      startValue: Number(startValue.toFixed(2)),
      endValue,
      netInvestment,
      periodReturn: Number(periodReturn.toFixed(2)),
      periodReturnPercent,
    };
  }

  private generateSummary(
    periodLabel: string,
    stats: ReturnType<typeof this.calculateTransactionStats>,
    returns: ReturnType<typeof this.calculateReturns>,
    holdings: HoldingRecord[],
  ) {
    const lines: string[] = [];

    lines.push(`【${periodLabel}投资复盘】`);
    lines.push('');
    lines.push('一、周期收益概览');
    lines.push(`  · 期末总资产：${returns.endValue.toFixed(2)} 元`);
    lines.push(`  · 期初估算资产：${returns.startValue.toFixed(2)} 元`);
    lines.push(`  · 期间净投入：${returns.netInvestment.toFixed(2)} 元`);
    lines.push(`  · 周期收益：${returns.periodReturn >= 0 ? '+' : ''}${returns.periodReturn.toFixed(2)} 元`);
    lines.push(`  · 周期收益率：${returns.periodReturnPercent >= 0 ? '+' : ''}${returns.periodReturnPercent}%`);
    lines.push('');
    lines.push('二、交易活动统计');
    lines.push(`  · 总交易次数：${stats.buyCount + stats.sellCount + stats.dividendCount} 笔`);
    lines.push(`  · 买入：${stats.buyCount} 笔，合计 ${stats.totalBuyAmount.toFixed(2)} 元`);
    lines.push(`  · 卖出：${stats.sellCount} 笔，合计 ${stats.totalSellAmount.toFixed(2)} 元`);
    if (stats.dividendCount > 0) {
      lines.push(`  · 分红：${stats.dividendCount} 笔，合计 ${stats.dividendIncome.toFixed(2)} 元`);
    }
    lines.push(`  · 手续费支出：${stats.totalFee.toFixed(2)} 元`);
    lines.push('');
    lines.push('三、当前持仓');
    if (holdings.length === 0) {
      lines.push('  · 暂无持仓');
    } else {
      for (const h of holdings) {
        const pnlPercent = h.avgCost > 0 ? ((h.pnl / (h.avgCost * h.quantity)) * 100).toFixed(2) : '0.00';
        lines.push(`  · ${h.symbol}：${h.quantity} 股，成本 ${h.avgCost.toFixed(2)}，现价 ${h.currentPrice.toFixed(2)}，盈亏 ${h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(2)}（${pnlPercent}%）`);
      }
    }
    lines.push('');
    lines.push('（以上数据为系统自动生成，可根据实际情况修改）');

    return lines.join('\n');
  }

  private generateDecisions(transactions: TransactionRecord[], holdings: HoldingRecord[]) {
    const decisions: Array<Record<string, unknown>> = [];
    const symbolMap = new Map(holdings.map((h) => [h.id, h.symbol]));

    const sortedTxs = [...transactions].sort(
      (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime(),
    );

    const largeTransactions = sortedTxs.filter((tx) => {
      const amount = tx.quantity * tx.price;
      return amount >= 100;
    }).slice(0, 5);

    for (const tx of largeTransactions) {
      const symbol = symbolMap.get(tx.holdingId) || `持仓#${tx.holdingId}`;
      const action = tx.type === TransactionType.BUY ? '买入' : tx.type === TransactionType.SELL ? '卖出' : '分红';
      const amount = (tx.quantity * tx.price).toFixed(2);

      decisions.push({
        action,
        symbol,
        quantity: tx.quantity,
        price: tx.price,
        amount: Number(amount),
        date: tx.executedAt.split('T')[0],
        reason: '',
        result: '',
      });
    }

    return decisions;
  }

  private generateLessons(
    stats: ReturnType<typeof this.calculateTransactionStats>,
    returns: ReturnType<typeof this.calculateReturns>,
  ) {
    const lessons: string[] = [];

    if (stats.buyCount + stats.sellCount > 10) {
      lessons.push('· 本期交易较为频繁，需关注交易成本对收益的侵蚀。');
    }

    if (returns.periodReturnPercent < 0) {
      lessons.push('· 本期收益为负，需反思入场时机和仓位管理。');
    }

    if (stats.totalFee > stats.totalBuyAmount * 0.01) {
      lessons.push('· 手续费占比较高，可考虑优化交易频次或选择更低费率的渠道。');
    }

    if (lessons.length === 0) {
      lessons.push('· 请补充本期投资心得与经验教训。');
    }

    return lessons.join('\n');
  }

  update(id: number, dto: UpdateReviewDto, user: CurrentUser) {
    const review = this.findOwned(id, user);
    Object.assign(review, dto);
    return review;
  }

  delete(id: number, user: CurrentUser) {
    const review = this.findOwned(id, user);
    this.reviews.splice(this.reviews.indexOf(review), 1);
    return { deleted: true, id };
  }

  private findOwned(id: number, user: CurrentUser) {
    const review = this.reviews.find((item) => item.id === id);
    if (!review) throw new NotFoundException('review not found');
    this.portfoliosService.findOwned(review.portfolioId, user);
    return review;
  }
}
