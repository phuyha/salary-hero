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
}