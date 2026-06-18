import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Portfolio } from '../../portfolios/entities/portfolio.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('holdings')
export class Holding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  portfolioId: number;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.holdings, { onDelete: 'CASCADE' })
  portfolio: Portfolio;

  @Column()
  symbol: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  avgCost: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  currentPrice: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  pnl: string;

  @OneToMany(() => Transaction, (transaction) => transaction.holding)
  transactions: Transaction[];
}

