import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ForgotPasswordEvent } from '../event/forgot-password.event';
import { SettingRepository } from '../dao/setting.repository';
import { Connection } from 'typeorm';
import { Inject } from '@nestjs/common';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { ConfigService } from '@nestjs/config';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { TokenTypeConstant } from '../domain/enums/token-type-constant';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from '../core/cron.enum';
import { Queue } from 'bull';
import { EmailQueueDto } from '../dto/email-queue.dto';

@EventsHandler(ForgotPasswordEvent)
export class ForgotPasswordHandler implements IEventHandler<ForgotPasswordEvent> {

  constructor(private readonly connection: Connection,
              @InjectQueue(Queues.EMAIL) private readonly emailQueue: Queue,
              private readonly configService: ConfigService,
              @Inject('EMAIL_VALIDATION_SERVICE') private emailValidationService: IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto>) {
  }

  async handle(event: ForgotPasswordEvent) {
    let portalUser = event.portalUser;
    let settingsRepository = this.connection
      .getCustomRepository(SettingRepository);
    let urlSetting = await settingsRepository
      .findByLabel('front_end_url', 'http://localhost:3000/api/v1');
    let callBackToken = await this.emailValidationService.createCallBackToken(portalUser, TokenTypeConstant.FORGOT_PASSWORD);
    const callBackUrl = `${urlSetting.value}/password/reset/${callBackToken}`;
    const projectName = this.configService.get<string>('PROJECT_NAME', 'Asobooks.com');
    let adminEmail = await settingsRepository.findByLabel('admin_email', 'admin@asobooks.com');

    const emailTemplateData: EmailQueueDto<{ firstName, callbackUrl, projectName }> = {
      data: {
        firstName: portalUser.firstName,
        projectName: projectName,
        callbackUrl: callBackUrl,
      },
      subject: `${projectName} Password Reset`,
      templateName: 'password-reset',
      to: portalUser.email,
      from: adminEmail.value,
      reply: adminEmail.value,
    };

    return this.emailQueue.add(emailTemplateData).catch(error => {
      console.log(error);
    });

  }

}