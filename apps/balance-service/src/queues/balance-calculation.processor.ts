import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@salary-hero/shared/common';
import { Job } from 'bullmq';
import { WorkerRepository, SalaryRateEnum } from '@salary-hero/salary-hero-repository';
import { ConfigService } from '@nestjs/config';
import { BALANCE_CALCULATION_QUEUE, DAILY_BALANCE_CALCULATION_JOB, MONTHLY_BALANCE_CALCULATION_JOB, sleep } from '../core/common';
import { BalanceCalculationMessage, RabbitmqMessagePayload } from '../interfaces/balance-calculation-message.interface';
import { AmqpConnection } from '@salary-hero/rabbitmq';

@Processor(BALANCE_CALCULATION_QUEUE)
export class BalanceCalculationProcessor extends WorkerHost {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly workerRepository: WorkerRepository,
    private readonly amqpConnection: AmqpConnection,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onQueueActive(job: Job) {
    this.logger.info(`Job has been started: ${job.id}!`);
  }

  @OnWorkerEvent('completed')
  onQueueComplete(job: Job, result: any) {
    this.logger.info(`Job has been finished: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onQueueFailed(job: Job, err: any) {
    this.logger.info(`Job has been failed: ${job.id}`);
    this.logger.error(err);
  }

  @OnWorkerEvent('error')
  onQueueError(err: any) {
    this.logger.info(`Job has got error: `);
    this.logger.error(err);
  }

  @OnWorkerEvent('stalled')
  onQueueStalled(job: Job) {
    this.logger.info(`Job has been stalled: ${job.id}`);
  }

  async process(job: Job) {
    this.logger.info(`Processing job: ${job.id}`);
    switch (job.name) {
      case MONTHLY_BALANCE_CALCULATION_JOB:
        await this.scanWorker({ salaryRate: SalaryRateEnum.MONTHLY, routingKey: this.configService.get('balanceService')?.monthlyRoutingKey });
        break;

      case DAILY_BALANCE_CALCULATION_JOB:
        await this.scanWorker({ salaryRate: SalaryRateEnum.DAILY, routingKey: this.configService.get('balanceService')?.dailyRoutingKey });
        break;

      default:
        break;
    }
  }

  private async scanWorker(payload: { salaryRate: SalaryRateEnum, routingKey: string }) {
    const startTime = Date.now();
    this.logger.info('Scanning daily worker');
    const where = [{ salaryRate: payload.salaryRate }];
    const total = await this.workerRepository.count({ where });
    const pageSize = this.configService.get('balanceService')?.workerPageSize || 50;
    const totalPage = Math.ceil(total / pageSize);
    let index = 0;
    while (index <= totalPage) {
      const workers = await this.workerRepository.find({ where, skip: index * pageSize, take: pageSize });
      if (workers.length) {
        Promise.all(workers.map(worker => {
          const message: BalanceCalculationMessage = {
            workerId: worker.id,
            balanceId: worker.balanceId,
            name: worker.name,
            salary: worker.salary,
            salaryRate: worker.salaryRate,
            logId: `${worker.id}-${Date.now()}`,
          }
          return this.sendWithRetry({ routingKey: payload.routingKey, message, exchange: this.configService.get('rabbitmq')?.mainExchange || '' });
        }))
      }

      index = index + 1
    }

  }

  private async sendWithRetry(payload: RabbitmqMessagePayload) {
    const { routingKey = '', message = {}, exchange = '' } = payload;
    let retryTime = payload.retryTime || 0;
    const maxRetry = payload.maxRetry || 3;
    try {
      if (retryTime > maxRetry) {
        this.logger.error({ payload, action: 'schedule_try_catch_publish' });
        return null
      }
      if (retryTime) {
        await sleep(2000);
      }
      await this.amqpConnection.publish(exchange, routingKey, message);
      this.logger.info('schedule', { action: 'schedule_send_done', payload });
    } catch (error) {
      this.logger.error('schedule_try_catch_publish', { action: 'schedule_try_catch_publish', error, payload });
      retryTime = retryTime + 1;
      payload.retryTime = retryTime;
      payload.error = error;
      payload.maxRetry = maxRetry;
      return this.sendWithRetry(payload);
    }
  }
}