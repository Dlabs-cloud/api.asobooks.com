import {PortalUser} from '../domain/entity/portal-user.entity';
import {ActivityTypeConstant} from "../domain/enums/activity-type-constant";
import {Association} from "../domain/entity/association.entity";

export class AssociationActivityEvent {
    constructor(public readonly association: Association, public readonly portalUser: PortalUser, public readonly activityType: ActivityTypeConstant) {
    }
}