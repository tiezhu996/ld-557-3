import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Portfolio } from '../../portfolios/entities/portfolio.entity';

@Entity('review_logs')
export class ReviewLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  portfolioId: number;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.reviews, { onDelete: 'CASCADE' })
  portfolio: Portfolio;

  @Column()
  period: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'jsonb', default: [] })
  decisions: Array<Record<string, unknown>>;

  @Column({ type: 'text', default: '' })
  lessons: string;

  @CreateDateColumn()
  createdAt: Date;
}

