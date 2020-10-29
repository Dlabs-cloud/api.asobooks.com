import { CacheModule, Module, Provider } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthenticationUtils } from './utils/authentication-utils.service';
import { CacheService } from './utils/cache.service';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({ format: winston.format.json() }),
      ],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          store: redisStore,
          ttl: 6 * 30 * 24 * 60 * 60,
          prefix: 'store',
          port: configService.get<number>('REDIS_PORT', 6379),
          host: configService.get<string>('REDIS_HOST', 'localhost'),
        };
      },
    }),
  ],
  exports: [WinstonModule, AuthenticationUtils, CacheService],
  providers: [AuthenticationUtils, CacheService],
})
export class CommonModule {
}
