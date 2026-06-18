import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionType } from '../../../constants/enums';
import { Holding } from '../../holdings/entities/holding.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  holdingId: number;

  @ManyToOne(() => Holding, (holding) => holding.transactions, { onDelete: 'CASCADE' })
  holding: Holding;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  quantity: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  price: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  fee: string;

  @Column({ type: 'timestamp' })
  executedAt: Date;
}

