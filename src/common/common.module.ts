import { CacheModule, Module, Provider } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthenticationUtils } from './utils/authentication-utils.service';
import { EmailMailerConfiguration } from '../conf/email/email.conf';
import { CacheService } from './utils/cache.service';
import * as redisStore from 'cache-manager-ioredis';


@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({ format: winston.format.json() }),
      ],
    }),
    CacheModule.registerAsync({
      useFactory: () => {
        return {
          store: redisStore,
          host: 'localhost',
          port: 6379,
        }
      },
    }),
  ],
  exports: [WinstonModule, AuthenticationUtils, CacheService],
  providers: [AuthenticationUtils, CacheService],
})
export class CommonModule {
}
