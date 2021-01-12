import { PortalUser } from '../domain/entity/portal-user.entity';
import { ActivityTypeConstant } from '../domain/enums/activity-type-constant';
import { Association } from '../domain/entity/association.entity';

export class ActivityLogEvent {
  private description: string;
  private association: Association;

  constructor(private readonly portalUser: PortalUser,
              public readonly activityType: ActivityTypeConstant) {
  }

  addDescription(desc: string) {
    return this;
  }

  addAssociation(association: Association) {
    return this;
  }


  build() {
    const activityLogEvent = new ActivityLogEvent(this.portalUser, this.activityType);
    activityLogEvent.description = this.description;
    activityLogEvent.association = this.association;
    return activityLogEvent;
  }


}