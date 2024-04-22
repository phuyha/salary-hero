import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worker } from '../entities';

@Injectable()
export class WorkerRepository extends Repository<Worker> {
  constructor(
    @InjectRepository(Worker) repository: Repository<Worker>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner)
  }

  async findWorkerBySalaryRate(salaryRate: number, skip = 0, take = 10): Promise<Worker[]> {
    return this.createQueryBuilder('worker')
      .where('worker.salaryRate = :salaryRate', { salaryRate })
      .orderBy('worker.id', 'ASC')
      .skip(skip)
      .take(take)
      .getMany();
  }
}