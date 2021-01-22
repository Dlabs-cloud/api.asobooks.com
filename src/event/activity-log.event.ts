import { PortalUser } from '../domain/entity/portal-user.entity';
import { ActivityTypeConstant } from '../domain/enums/activity-type-constant';
import { Association } from '../domain/entity/association.entity';

export class ActivityLogEvent {


  constructor(public readonly portalUser: PortalUser,
              public readonly association: Association,
              public readonly description: string,
              public readonly type: ActivityTypeConstant) {
  }


}