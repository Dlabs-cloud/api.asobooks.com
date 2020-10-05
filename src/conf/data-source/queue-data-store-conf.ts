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
              port: configService.get<number>('REDIS_PORT', 6379),
              host: configService.get<string>('REDIS_HOST', 'localhost'),
            },
          };
        },
      };
    });
  }


}