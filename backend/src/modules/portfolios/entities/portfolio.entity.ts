import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PortfolioType, RiskLevel } from '../../../constants/enums';
import { User } from '../../auth/entities/user.entity';
import { Holding } from '../../holdings/entities/holding.entity';
import { ReviewLog } from '../../reviews/entities/review-log.entity';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.portfolios, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'enum', enum: PortfolioType })
  type: PortfolioType;

  @Column({ type: 'enum', enum: RiskLevel })
  riskLevel: RiskLevel;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalValue: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Holding, (holding) => holding.portfolio)
  holdings: Holding[];

  @OneToMany(() => ReviewLog, (review) => review.portfolio)
  reviews: ReviewLog[];
}

