import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NewUserAccountSignUpEvent } from '../event/new-user-account-sign-up.event';
import { Connection } from 'typeorm';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Inject } from '@nestjs/common';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { SettingRepository } from '../dao/setting.repository';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';


@EventsHandler(NewUserAccountSignUpEvent)
export class NewUserAccountSignUpHandler implements IEventHandler<NewUserAccountSignUpEvent> {

  constructor(private readonly connection: Connection,
              private readonly mailerService: MailerService,
              @Inject('EMAIL_VALIDATION_SERVICE') private emailValidationService: IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto>) {
  }

  async handle(event: NewUserAccountSignUpEvent) {
    const portalAccount = event.portalAccount;
    const portalUser = event.portalUser

    console.log(portalUser);
    let urlSetting = await this.connection
      .getCustomRepository(SettingRepository)
      .findByLabel('front_end_url', 'http://localhost:3000/api/v1');
    let callBackToken = await this.emailValidationService.createCallBackToken(portalUser, TokenTypeConstant.PRINCIPAL_USER_SIGN_UP, portalAccount);
    const callBackUrl = `${urlSetting.value}/validate-principal/${callBackToken}`;
    console.log(callBackUrl);

    this.mailerService.sendMail({
      to: portalUser.email,
      subject: `Welcome to socialite.io`,
      template: 'admin-signup',
      context: {
        firstName: portalUser.firstName,
        callbackUrl: callBackUrl,
      },
    }).catch((error) => {
      console.log(error);
    });

  }

}