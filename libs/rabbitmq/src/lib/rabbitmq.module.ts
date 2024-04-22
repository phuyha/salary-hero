import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import * as _ from 'lodash';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return _.pick(config.get('rabbitmq'), [
          'exchanges',
          'uri',
          'connectionInitOptions',
          'prefetchCount',
          'connectionManagerOptions'
        ]) as RabbitMQConfig;
      },
    }),
  ],
  providers: [],
  exports: [RabbitMQModule],
})
export class RabbitmqModule { }
