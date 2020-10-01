import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { CronQueue, QueueNames } from '../cron.enum';
import { Queue } from 'bull';
import { ServiceTypeConstant } from '../../domain/enums/service-type.constant';

@Injectable()
export class CronStartup implements OnApplicationBootstrap {
  constructor(@InjectQueue(CronQueue.SUBSCRIPTION) private readonly subscriptionCronQueue: Queue,
              @InjectQueue(CronQueue.BILL_GENERATION) private readonly billGenerationQueue: Queue) {
  }

  async onApplicationBootstrap() {
/*
    // await this.subscriptionCronQueue.add({
    //   'type': ServiceTypeConstant.RE_OCCURRING,
    // }, {
    //   repeat: {
    //     every: 1 * 1000,
    //   },
    // });
    //
    // await this.subscriptionCronQueue.add({
    //   'type': ServiceTypeConstant.ONE_TIME,
    // }, {
    //   repeat: {
    //     every: 2 * 1000,
    //   },
    // });
*/

    await this.billGenerationQueue.add(null, {
        repeat: {
          every: 2 * 1000,
        },
      },
    );

  }


}