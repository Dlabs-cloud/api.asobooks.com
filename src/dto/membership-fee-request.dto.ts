import { ArrayMinSize, IsArray, IsOptional, Min, MinLength } from 'class-validator';

export class MembershipFeeRequestDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  memberIdentifiers: string[];
}