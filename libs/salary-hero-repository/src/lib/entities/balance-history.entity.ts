import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('balance_history')
export class BalanceHistory extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true, name: 'balance_id' })
  balanceId: number;

  @Column({ type: 'decimal', name: 'available' })
  available: number;

  @Column({ type: 'decimal', name: 'pending' })
  pending: number;
}