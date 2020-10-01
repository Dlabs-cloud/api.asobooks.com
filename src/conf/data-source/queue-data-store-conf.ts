import { BullModuleAsyncOptions } from '@nestjs/bull';
import { CronQueue } from '../../core/cron.enum';
import { ConfigModule, ConfigService } from '@nestjs/config';

export class QueueDataStoreConf {
  static createBullOptions(): BullModuleAsyncOptions[] {
    return Object.values(CronQueue).map(queue => {
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