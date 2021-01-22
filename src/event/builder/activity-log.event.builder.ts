import { Association } from '../../domain/entity/association.entity';
import { ActivityTypeConstant } from '../../domain/enums/activity-type-constant';
import { PortalUser } from '../../domain/entity/portal-user.entity';
import { ActivityLog } from '../../domain/entity/activity-log.entity';

export class ActivityLogEventBuilder {
  private description: string;
  private user: PortalUser;


  constructor(private readonly type: ActivityTypeConstant, private readonly association: Association) {
  }


  addDescription(desc: string) {
    this.description = desc;
    return this;
  }

  by(user: PortalUser) {
    this.user = user;
    return this;
  }

  build() {
    return new ActivityLog();
  }

}