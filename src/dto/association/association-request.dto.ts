import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';
import { FileDto } from '../file.dto';
import { IsEntityExist } from '../../common/class-validators/entity-constraint.validator';

export class AssociationRequestDto {
  @IsString()
  name: string;
  @IsEnum(AssociationTypeConstant)
  type: AssociationTypeConstant;
  @IsString()
  address: string;
  @IsString()
  countryCode: string;
  logo: FileDto;
  @IsEntityExist({
    column: 'code',
    isExist: true,
    name: 'bank',

  }, {
    message: 'Bank name does not exist',
  })
  bankCode: string;
  @IsString()
  accountNumber: string;
  @IsBoolean()
  activateAssociation: boolean;

}