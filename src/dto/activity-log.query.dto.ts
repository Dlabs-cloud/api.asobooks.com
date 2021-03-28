import { ActivityTypeConstant } from '../domain/enums/activity-type-constant';
import { IsEnum, IsOptional } from 'class-validator';

export class ActivityLogQueryDto {
  @IsOptional()
  @IsEnum(ActivityTypeConstant)
  type: ActivityTypeConstant;
  @IsOptional()
  limit?: number;
  @IsOptional()
  offset?: number;
}
