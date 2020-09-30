import { BullModuleAsyncOptions } from '@nestjs/bull';
import { CronQueue } from '../../core/cron.enum';
import { ConfigModule, ConfigService } from '@nestjs/config';

export class QueueDataStoreConf {
  static createBullOptions(): BullModuleAsyncOptions[] {
    console.log('Sstating to set up queue on main app');
    return Object.values(CronQueue).map(queue => {
      console.log(queue);
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