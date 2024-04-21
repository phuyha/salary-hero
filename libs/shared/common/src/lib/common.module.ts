import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Logger } from './logger/logger.service';

@Module({
  imports: [ConfigModule],
  providers: [Logger],
  exports: [Logger],
})
export class CommonModule {}
