import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { CronQueue } from '../cron.enum';
import { Queue } from 'bull';

@Injectable()
export class CronStartup implements OnApplicationBootstrap {
  constructor(@InjectQueue(CronQueue.SUBSCRIPTION) private readonly subscriptionCronQueue: Queue) {
  }

  async onApplicationBootstrap() {
    await this.subscriptionCronQueue.add(null, {
      repeat: {
        every: 10 * 1000,
      },
    });
  }



}