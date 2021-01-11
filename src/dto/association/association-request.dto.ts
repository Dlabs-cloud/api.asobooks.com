import { IsBooleanString, IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';
import { FileDto } from '../file.dto';
import { AssociationAddressRequestDto } from './association-address-request.dto';
import { BankInfoRequestDto } from '../user/bank-info-request.dto';
import { Type } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import { FileUploadResponseDto } from '../file-upload.response.dto';

export class AssociationRequestDto {
  @IsString()
  name: string;
  @IsEnum(AssociationTypeConstant)
  type: AssociationTypeConstant;
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => AssociationAddressRequestDto)
  address?: AssociationAddressRequestDto;
  @IsBooleanString()
  activateAssociation: boolean | string;
  @ValidateNested()
  @IsObject()
  @IsOptional()
  @Type(() => BankInfoRequestDto)
  bankInfo?: BankInfoRequestDto;
  @ApiHideProperty()
  logo?: FileDto | FileUploadResponseDto;

}