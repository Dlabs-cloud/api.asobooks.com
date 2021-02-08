import { IsNumber, IsOptional } from 'class-validator';

export class ServiceSubscriptionSearchQueryDto {

  @IsOptional()
  startDate?: string;
  @IsOptional()
  endDate?: string;
  @IsOptional()
  @IsNumber()
  limit: number;
  @IsOptional()
  @IsNumber()
  offset: number;


}