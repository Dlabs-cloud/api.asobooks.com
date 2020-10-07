import { Module, Provider } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthenticationUtils } from './utils/authentication-utils.service';
import { EmailMailerConfiguration } from '../conf/email/email.conf';


@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({ format: winston.format.json() }),
      ],
    }),
  ],
  exports: [WinstonModule, AuthenticationUtils],
  providers: [AuthenticationUtils],
})
export class CommonModule {
}
