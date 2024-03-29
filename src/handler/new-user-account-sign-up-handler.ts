import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NewUserAccountSignUpEvent } from '../event/new-user-account-sign-up.event';
import { Connection } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { Inject } from '@nestjs/common';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { SettingRepository } from '../dao/setting.repository';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from '../core/cron.enum';
import { Queue } from 'bull';
import { EmailQueueDto } from '../dto/email-queue.dto';


@EventsHandler(NewUserAccountSignUpEvent)
export class NewUserAccountSignUpHandler implements IEventHandler<NewUserAccountSignUpEvent> {

  constructor(private readonly connection: Connection,
              private readonly mailerService: MailerService,
              @InjectQueue(Queues.EMAIL) private readonly emailQueue: Queue,
              @Inject('EMAIL_VALIDATION_SERVICE') private emailValidationService: IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto>) {
  }

  async handle(event: NewUserAccountSignUpEvent) {
    const portalAccount = event.portalAccount;
    const portalUser = event.portalUser;
    let settingsRepository = this.connection
      .getCustomRepository(SettingRepository);
    let urlSetting = await settingsRepository
      .findByLabel('front_end_url', 'http://localhost:3000/api/v1');
    let adminEmail = await settingsRepository.findByLabel('admin_email', 'admin@asobooks.com');
    let callBackToken = await this.emailValidationService.createCallBackToken(portalUser, TokenTypeConstant.PRINCIPAL_USER_SIGN_UP, portalAccount);
    const callBackUrl = `${urlSetting.value}/verify/${callBackToken}`;
    const emailTemplateData: EmailQueueDto<{ firstName, callbackUrl }> = {
      data: {
        callbackUrl: callBackUrl,
        firstName: portalUser.firstName,
      },
      subject: `Welcome to AsoBooks`,
      templateName: 'admin-signup',
      to: portalUser.email,
      from: adminEmail.value,
      reply: adminEmail.value,
    };

    return this.emailQueue.add(emailTemplateData).catch(error => {
      console.log(error);
    });

  }

}
