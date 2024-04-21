import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from '../entities';

@Injectable()
export class BalanceRepository extends Repository<Balance> {
  constructor(
    @InjectRepository(Balance) repository: Repository<Balance>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner)
  }
}