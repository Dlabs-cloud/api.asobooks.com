import { IsOptional, IsString } from 'class-validator';

export class ServiceSubscriptionSearchQueryDto {

  @IsOptional()
  startDate?: string;
  @IsOptional()
  endDate?: string;
  @IsString()
  @IsOptional()
  limit: number;
  @IsString()
  @IsOptional()
  offset: number;


}