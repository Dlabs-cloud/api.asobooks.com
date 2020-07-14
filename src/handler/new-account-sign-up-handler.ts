import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NewAccountSignUpEvent } from '../event/new-account-sign-up.event';
import { Connection } from 'typeorm';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Inject } from '@nestjs/common';
import { EmailValidationService } from '../common/contracts/email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { SettingRepository } from '../dao/setting.repository';


@EventsHandler(NewAccountSignUpEvent)
export class NewAccountSignUpHandler implements IEventHandler<NewAccountSignUpEvent> {

  constructor(private readonly connection: Connection,
              private readonly mailerService: MailerService,
              @Inject('EMAIL_VALIDATION_SERVICE') private emailValidationService: EmailValidationService<PortalUser>) {
  }

  async handle(event: NewAccountSignUpEvent) {
    const portalUser = await this.connection
      .getCustomRepository(PortalUserRepository)
      .findFirstByPortalAccount(event.portalAccount, GenericStatusConstant.IN_ACTIVE);
    let urlSetting = await this.connection
      .getCustomRepository(SettingRepository)
      .findByLabel('front_end_url', 'http://localhost:3000/api/v1');
    let callBackToken = await this.emailValidationService.validateCallBackToken(portalUser);
    const callBackUrl = `${urlSetting.value}/user-management/validate-principal/${callBackToken}`;
    await this.mailerService.sendMail({
      to: portalUser.email,
      subject: `Welcome to socialite.io`,
      template: 'admin-signup',
      context: {
        firstName: portalUser.firstName,
        callbackUrl: callBackUrl,
      },
    });

  }

}