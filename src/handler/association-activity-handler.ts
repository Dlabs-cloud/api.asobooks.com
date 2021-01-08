import {EventsHandler, IEventHandler} from '@nestjs/cqrs';
import {MailerService} from '@nestjs-modules/mailer';
import {ConfigService} from '@nestjs/config';
import {Connection} from 'typeorm';
import {getManager} from "typeorm/index";
import {AssociationActivityEntity} from "../domain/entity/association-activity.entity";
import {Membership} from "../domain/entity/membership.entity";
import {AssociationActivityEvent} from "../event/AssociationActivityEvent";
import {AssociationRepository} from "../dao/association.repository";
import {GenericStatusConstant} from "../domain/enums/generic-status-constant";

@EventsHandler(AssociationActivityEvent)
export class AssociationActivityHandler implements IEventHandler<AssociationActivityEvent> {

    constructor(
        private readonly connection: Connection,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService) {
    }

    async handle(event: AssociationActivityEvent) {
        const entityManager = getManager();

        const portalUser = event.portalUser;

        const associationActivity = new AssociationActivityEntity();
        associationActivity.description = `New member created. ${portalUser.firstName} ${portalUser.lastName}`
        associationActivity.activityType = event.activityType;
        associationActivity.association = event.association;
        associationActivity.membership = await getManager().findOne(Membership, {
            where: {
                portalUserId: portalUser.id
            }
        });
        await entityManager.save(associationActivity);
    }

}