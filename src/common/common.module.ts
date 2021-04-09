import { CacheModule, Module, Provider } from '@nestjs/common';
import { AuthenticationUtils } from './utils/authentication-utils.service';
import { CacheService } from './utils/cache.service';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
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
  exports: [AuthenticationUtils, CacheService],
  providers: [AuthenticationUtils, CacheService],
})
export class CommonModule {
}
