import { IsArray, IsOptional } from 'class-validator';

export class MembershipFeeRequestDto {
  @IsOptional()
  @IsArray()
  memberIdentifiers: string[];
}