import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';
import { FileDto } from '../file.dto';

export class AssociationRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  @IsEnum(AssociationTypeConstant)
  type: AssociationTypeConstant;
  @IsString()
  @IsNotEmpty()
  address: string;
  @IsString()
  countryCode: string;
  logo: FileDto;

}