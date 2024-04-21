import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { V8ProfilerModule } from '@salary-hero/shared/v8-profiler';
import { CommonModule } from '@salary-hero/shared/common';
import { UtilModule } from '@salary-hero/shared/util';

@Module({
  imports: [
    CommonModule,
    UtilModule,
    CoreModule,
    V8ProfilerModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
