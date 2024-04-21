import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance, BalanceHistory } from '../entities';

@Injectable()
export class BalanceHistoryRepository extends Repository<BalanceHistory> {
  constructor(
    @InjectRepository(BalanceHistory) repository: Repository<BalanceHistory>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner)
  }
}