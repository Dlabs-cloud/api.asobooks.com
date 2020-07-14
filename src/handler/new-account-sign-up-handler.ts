import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NewAccountSignUpEvent } from '../event/new-account-sign-up.event';
import { Connection } from 'typeorm';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';


@EventsHandler(NewAccountSignUpEvent)
export class NewAccountSignUpHandler implements IEventHandler<NewAccountSignUpEvent> {

  constructor(private readonly connection: Connection,
              private readonly mailerService: MailerService) {
  }

  async handle(event: NewAccountSignUpEvent) {
    const portalUser = await this.connection
      .getCustomRepository(PortalUserRepository)
      .findFirstByPortalAccount(event.portalAccount, GenericStatusConstant.IN_ACTIVE);
    console.log('About to send email not here');
    await this.mailerService.sendMail({
      to: portalUser.email,
      subject: `Welcome to socialite.io`,
      template: 'admin-signup',
      context: {
        firstName: portalUser.firstName,
        callbackUrl: 'https://punchng.com',
      },
    });

  }

}