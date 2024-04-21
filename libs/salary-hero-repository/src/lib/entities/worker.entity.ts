import { Column, Entity, JoinTable, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SalaryRateEnum } from '../enums/salary-rate.enum';
import { BaseEntity } from './base.entity';
import { Balance } from './balance.entity';

@Entity('worker')
export class Worker extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true, name: 'balance_id' })
  balanceId: number

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 255, name: 'salary_rate' })
  salaryRate: SalaryRateEnum;

  @Column({ type: 'decimal', name: 'salary' })
  salary: number;

  @Column({ type: 'int', name: 'no_working_day' })
  noWorkingDay: number;

  @OneToOne(() => Balance, (balance) => balance.worker)
  @JoinTable()
  balance: Balance;
}