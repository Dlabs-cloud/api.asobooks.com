import { Module, Provider } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthenticationUtils } from './utils/authentication-utils.service';
import { EmailService } from '../conf/email/email.service';


@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({ format: winston.format.json() }),
      ],
    }),
  ],
  exports: [WinstonModule, AuthenticationUtils, EmailService],
  providers: [AuthenticationUtils, EmailService],
})
export class CommonModule {
}
