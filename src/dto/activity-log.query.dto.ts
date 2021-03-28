import { ActivityTypeConstant } from '../domain/enums/activity-type-constant';

export class ActivityLogQueryDto {
  type: ActivityTypeConstant;
  limit: number;
  offset: number;
}
