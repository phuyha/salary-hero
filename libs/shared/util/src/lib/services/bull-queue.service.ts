import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Logger } from '@salary-hero/shared/common';

@Injectable()
export class BullQueueService {
  constructor(private readonly logger: Logger) { }

  public async initJob(jobName: string, every: number, queue: Queue) {
    let jobs = await queue.getRepeatableJobs();
    jobs = jobs.filter(job => job.name === jobName);
    this.logger.info(`[${jobName}] Found ${jobs.length} old jobs`);
    if (jobs.length !== 0) {
      await Promise.all(jobs.map(job => queue.removeRepeatableByKey(job.key)));
    }
    this.logger.info(`[${jobName}] Successfully removed all old jobs, adding new jobs`);
    await queue.add(jobName, {}, {
      repeat: { every },
      backoff: 0,
      removeOnComplete: true,
      removeOnFail: 100,
      stackTraceLimit: 1,
    });
  }
}
