import { AssociationRequestDto } from './association/association-request.dto';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class AssociationOnboardingDto extends AssociationRequestDto {

  @ApiHideProperty()
  logoServingUrl?: string;
  @ApiHideProperty()
  hostIdentifier?: string;
  @ApiProperty({ type: 'string', format: 'binary' })
  file?: any;

}