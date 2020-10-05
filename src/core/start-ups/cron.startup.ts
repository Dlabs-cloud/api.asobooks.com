import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from '../cron.enum';
import { Queue } from 'bull';

@Injectable()
export class CronStartup implements OnApplicationBootstrap {
  constructor(@InjectQueue(Queues.SUBSCRIPTION) private readonly subscriptionCronQueue: Queue,
              @InjectQueue(Queues.BILL_GENERATION) private readonly billGenerationQueue: Queue) {
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