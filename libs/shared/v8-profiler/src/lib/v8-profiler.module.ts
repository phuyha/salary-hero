import { Module } from '@nestjs/common';
import { V8ProfilerService } from './service';

@Module({
  providers: [V8ProfilerService],
  exports: [V8ProfilerService],
})
export class V8ProfilerModule { }
