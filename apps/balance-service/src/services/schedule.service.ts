import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullQueueService } from '@salary-hero/shared/util';
import { Logger } from '@salary-hero/shared/common';
import { BALANCE_CALCULATION_QUEUE, DAILY_BALANCE_CALCULATION_JOB, MONTHLY_BALANCE_CALCULATION_JOB } from '../core/common';

@Injectable()
export class ScheduleServiceService {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    @InjectQueue(BALANCE_CALCULATION_QUEUE) private readonly queue: Queue,
    private readonly bullQueueService: BullQueueService,
  ) {
    this.bullQueueService.initJob(MONTHLY_BALANCE_CALCULATION_JOB, this.configService.get('balanceService')?.pattern, this.queue);
    this.bullQueueService.initJob(DAILY_BALANCE_CALCULATION_JOB, this.configService.get('balanceService')?.pattern, this.queue);
  }
}
