import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceHistoryRepository, BalanceRepository, WorkerRepository } from './repositories';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('db'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
      }),
    }),
    TypeOrmModule.forFeature([
      BalanceRepository,
      BalanceHistoryRepository,
      WorkerRepository,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class SalaryHeroRepositoryModule { }
