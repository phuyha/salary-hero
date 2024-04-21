import { Injectable } from '@nestjs/common';
import * as profiler from 'v8-profiler-next';
import { V8ProfilerDto } from '../dto';
import { nanoid } from 'nanoid';
import { promises as fs } from 'fs';
profiler.setGenerateType(1);

const sleep = async (timeMs: number): Promise<void> => new Promise(resolve => setTimeout(() => resolve(), timeMs));

@Injectable()
export class V8ProfilerService {

  public async getCpuProfiling(query: V8ProfilerDto) {
    const durationInMilliSec = (query.durationSec || 15) * 1000;
    const profileId = nanoid(10);
    profiler.startProfiling(profileId);
    await sleep(durationInMilliSec);
    const p = profiler.stopProfiling(profileId);
    p.export(async (err, result) => {
      if (err) {
        console.error(err);
        return err;
      }
      await fs.writeFile(`logs/cpu-${(new Date()).toISOString().split(`\\`).join('_').split('/').join('_').split(':').join('_').split('.').join('_')}.cpuprofile`, result || '');
      p.delete();
      return true;
    });
  }

  public async getMemoryUsage() {
    const snapshot = profiler.takeSnapshot();
    return new Promise((resolve, reject) => {
      return snapshot.export(async (err, result) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        await fs.writeFile(`logs/heap-${(new Date()).toISOString().split(`\\`).join('_').split('/').join('_').split(':').join('_').split('.').join('_')}.heapsnapshot`, result || '');
        snapshot.delete();
        return resolve(null);
      });
    });
  }
}
