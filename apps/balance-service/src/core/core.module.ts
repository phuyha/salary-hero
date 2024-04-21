import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SalaryHeroRepositoryModule } from '@salary-hero/salary-hero-repository';

const config = require('config');
@Global()
@Module({
  imports: [
    SalaryHeroRepositoryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
  ],
})
export class CoreModule { }
