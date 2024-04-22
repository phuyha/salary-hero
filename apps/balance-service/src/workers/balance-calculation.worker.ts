import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@salary-hero/shared/common';
import { RabbitmqMessagePayload } from '../interfaces/balance-calculation-message.interface';
import { SalaryRateEnum } from '@salary-hero/salary-hero-repository';
import { BalanceHistoryRepository, BalanceRepository } from 'libs/salary-hero-repository/src/lib/repositories';

const config = require('config');

@Injectable()
export class ProcessSyncProductService {
  private readonly rabbitmqConfig;

  constructor(
    private readonly logger: Logger,
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
    private readonly balanceRepository: BalanceRepository,
    private readonly balanceHistoryRepository: BalanceHistoryRepository,
  ) {
    this.rabbitmqConfig = configService.get('rabbitmq');
  }

  @RabbitSubscribe({
    exchange: config.rabbitmq.mainExchange,
    routingKey: [ config.balanceService.monthlyRoutingKey, config.balanceService.dailyRoutingKey ],
    queue: config.balanceService.queue,
    queueOptions: {
      durable: true,
      arguments: { 'x-queue-type': 'quorum' },
    },
    allowNonJsonMessages: true,
  })
  private async calculateBalance(payload: RabbitmqMessagePayload) {
    if (typeof payload === 'string' || !payload) {
      this.logger.warn('[calculateBalance] invalid message', payload);
      return;
    }
    try {
      if (!payload.retryTime) payload.retryTime = 0;
      if (!payload.maxRetry) payload.maxRetry = this.configService.get('balanceService')?.maxRetry || 0;
      this.logger.info({payload, action: 'start handle' });

      const workedDays = new Date().getDate();
      let availableBalance = 0;
      switch (payload.message.salaryRate) {
        case SalaryRateEnum.MONTHLY:
          availableBalance = this.calculateMonthlyBalance(workedDays, payload);
          break;
        case SalaryRateEnum.MONTHLY:
          availableBalance = this.calculateDailyBalance(workedDays, payload);
          break;
      
        default:
          break;
      }
      
      // Save balance to database
      const balance = await this.balanceRepository.save({ workerId: payload.message.workerId, available: availableBalance });

      // Save balance history to database
      await this.balanceHistoryRepository.save({ ...balance, balanceId: balance.id });
    } catch (error) {
      this.logger.error({ error, payload, action: 'calculateBalance' });
    }
  }

  private calculateMonthlyBalance(workedDays: number, payload: RabbitmqMessagePayload): number {
    return payload.message.salary / 30 * workedDays;
  }

  private calculateDailyBalance(workedDays: number, payload: RabbitmqMessagePayload): number {
    return payload.message.salary * workedDays;
  }
}