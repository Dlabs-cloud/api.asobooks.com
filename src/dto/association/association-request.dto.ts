import {
  isBoolean,
  IsBoolean, IsBooleanString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';
import { FileDto } from '../file.dto';
import { IsEntityExist } from '../../common/class-validators/entity-constraint.validator';
import { AssociationAddressRequestDto } from './association-address-request.dto';
import { BankInfoRequestDto } from '../user/bank-info-request.dto';
import { Type } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import { FileUploadResponseDto } from '../file-upload.response.dto';

export class AssociationRequestDto {
  @IsString()
  @IsOptional()
  name?: string;
  @IsOptional()
  @IsEnum(AssociationTypeConstant)
  type?: AssociationTypeConstant;
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => AssociationAddressRequestDto)
  address?: AssociationAddressRequestDto;
  @IsBooleanString()
  @IsOptional()
  activateAssociation?: boolean | string;
  @ValidateNested()
  @IsObject()
  @IsOptional()
  @Type(() => BankInfoRequestDto)
  bankInfo?: BankInfoRequestDto;
  @ApiHideProperty()
  logo?: FileDto | FileUploadResponseDto;

}