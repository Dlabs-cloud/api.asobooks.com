import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ForgotPasswordEvent } from '../event/forgot-password.event';
import { SettingRepository } from '../dao/setting.repository';
import { Connection } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { Inject } from '@nestjs/common';
import { EmailValidationService } from '../contracts/email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { ConfigService } from '@nestjs/config';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TokenPayload } from '../dto/TokenPayload';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { error } from 'winston';

@EventsHandler(ForgotPasswordEvent)
export class ForgotPasswordHandler implements IEventHandler<ForgotPasswordEvent> {

  constructor(private readonly connection: Connection,
              private readonly mailerService: MailerService,
              private readonly configService: ConfigService,
              @Inject('EMAIL_VALIDATION_SERVICE') private emailValidationService: EmailValidationService<PortalUser, PortalAccount, TokenPayload>) {
  }

  async handle(event: ForgotPasswordEvent) {
    let portalUser = event.portalUser;
    let urlSetting = await this.connection
      .getCustomRepository(SettingRepository)
      .findByLabel('front_end_url', 'http://localhost:3000/api/v1');
    let callBackToken = await this.emailValidationService.createCallBackToken(portalUser, TokenTypeConstant.FORGOT_PASSWORD);
    const callBackUrl = `${urlSetting.value}/password/reset/${callBackToken}`;
    const projectName = this.configService.get<string>('PROJECT_NAME', 'Socialite.io');

    await this.mailerService.sendMail({
      to: portalUser.email,
      subject: `${projectName} Password Reset`,
      template: 'password-reset',
      context: {
        firstName: portalUser.firstName,
        projectName: projectName,
        callbackUrl: callBackUrl,
      },
    }).catch(error => {
      console.log(error);
    });

  }

}