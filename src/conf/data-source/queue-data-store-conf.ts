import { BullModuleAsyncOptions } from '@nestjs/bull';
import { CronQueue } from '../../core/cron.enum';
import { ConfigModule, ConfigService } from '@nestjs/config';

export class QueueDataStoreConf {
  static createBullOptions(): BullModuleAsyncOptions[] {
    console.log(Object.values(CronQueue));
    return Object.values(CronQueue).map(cron => {
      const value: BullModuleAsyncOptions = {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          console.log(configService.get<number>('REDIS_PORT', 6379));
          return {
            name: cron,
            redis: {
              port: configService.get<number>('REDIS_PORT', 6379),
              host: configService.get<string>('REDIS_HOST', 'localhost'),
            },
          };
        },
      };
      return value;
    });


  }

}