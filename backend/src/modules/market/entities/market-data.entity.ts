import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AssetStatus } from '../../../constants/enums';

@Entity('market_data')
export class MarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  symbol: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  price: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  change: string;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  changePercent: string;

  @Column({ type: 'bigint', default: 0 })
  volume: string;

  @Column({ type: 'bigint', default: 0 })
  marketCap: string;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.ACTIVE })
  status: AssetStatus;

  @UpdateDateColumn()
  updatedAt: Date;
}

