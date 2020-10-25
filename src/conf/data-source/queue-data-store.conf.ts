import { BullModuleAsyncOptions } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queues } from '../../core/cron.enum';

export class QueueDataStoreConf {
  static createBullOptions(): BullModuleAsyncOptions[] {

    return Object.values(Queues).map(queue => {

      return {
        name: queue,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          return {
            redis: {
              port: 1223,
              host: 'redis_cache',
            },
          };
        },
      };
    });
  }


}