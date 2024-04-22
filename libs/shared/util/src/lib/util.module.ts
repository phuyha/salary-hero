import { Module } from '@nestjs/common';
import { BullQueueService } from './services/bull-queue.service';
import { CommonModule } from '@salary-hero/shared/common';

@Module({
  controllers: [CommonModule],
  providers: [BullQueueService],
  exports: [BullQueueService],
})
export class UtilModule {}
