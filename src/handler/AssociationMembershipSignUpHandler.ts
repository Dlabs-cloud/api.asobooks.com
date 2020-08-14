import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AssociationMembershipSignUpEvent } from '../event/AssociationMembershipSignUpEvent';
import { SettingRepository } from '../dao/setting.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';

@EventsHandler(AssociationMembershipSignUpEvent)
export class AssociationMembershipSignUpHandler implements IEventHandler<AssociationMembershipSignUpEvent> {

  constructor(
    private readonly connection: Connection,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService) {
  }

  async handle(event: AssociationMembershipSignUpEvent) {
    let portalUser = event.portalUser;

    let urlSetting = await this.connection
      .getCustomRepository(SettingRepository)
      .findByLabel('front_end_url', 'http://localhost:3000/api/v1');
    const callBackUrl = `${urlSetting.value}/login`;
    const projectName = this.configService.get<string>('PROJECT_NAME', 'Socialite.io');

    try {
      const response = await this.mailerService.sendMail({
        to: portalUser.email,
        subject: `${projectName} Welcome`,
        template: 'password-reset',
        context: {
          firstName: portalUser.firstName,
          projectName: projectName,
          callbackUrl: callBackUrl,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

}