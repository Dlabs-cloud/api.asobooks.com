import { IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AssociationTypeConstant } from '../domain/enums/association-type-constant';
import { BankInfoRequestDto } from './user/bank-info-request.dto';
import { Type } from 'class-transformer';
import { AssociationAddressUpdateRequestDto } from './association-address-update.request.dto';
import { ApiHideProperty } from '@nestjs/swagger';
import { FileDto } from './file.dto';
import { FileUploadResponseDto } from './file-upload.response.dto';

export class UpdateAssociationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @IsObject()
  @Type(() => AssociationAddressUpdateRequestDto)
  address?: AssociationAddressUpdateRequestDto;

  @IsOptional()
  @IsEnum(AssociationTypeConstant)
  type?: AssociationTypeConstant;

  @IsOptional()
  @ValidateNested()
  @IsObject()
  @Type(() => BankInfoRequestDto)
  bankInfo?: BankInfoRequestDto;

  @ApiHideProperty()
  logo?: FileDto | FileUploadResponseDto;

}
