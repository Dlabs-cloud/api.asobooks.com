import { ActivityTypeConstant } from '../domain/enums/activity-type-constant';

export class ActivityLogDto {
  date: Date;
  type: ActivityTypeConstant;
  description: string;
}