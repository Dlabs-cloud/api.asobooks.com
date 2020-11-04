import {PortalUser} from "../../domain/entity/portal-user.entity";
import {ActivityTypeConstant} from "../../domain/enums/activity-type-constant";

export class RecentActivitiesDto {
    activity: string
    activityType: ActivityTypeConstant
    createdBy?: PortalUser;
    dateCreated?: Date;
}