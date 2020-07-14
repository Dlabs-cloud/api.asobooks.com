import { Module, Provider } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthenticationUtils } from './utils/authentication-utils.service';
import { EmailService } from '../conf/email/email.service';
import { ValidationService } from '../service/validation-service';
import { EmailValidationService } from './contracts/email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { ServiceModule } from '../service/service.module';
import { AuthenticationService } from '../service/authentication.service';

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
