import { Column, Entity, JoinTable, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Worker } from './worker.entity';

@Entity('balance')
export class Balance extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true, name: 'worker_id' })
  workerId: number

  @Column({ type: 'decimal', name: 'available' })
  available: number;

  @OneToOne(() => Worker, (worker) => worker.balance)
  @JoinTable()
  worker: Worker;
}