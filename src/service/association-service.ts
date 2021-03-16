import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { Association } from '../domain/entity/association.entity';
import { UpdateAssociationDto } from '../dto/update-association.dto';

export const ASSOCIATION_SERVICE = 'ASSOCIATION_SERVICE';
export const CACHE_ASSOCIATION_SERVICE = 'CACHE_ASSOCIATION_SERVICE';

export interface AssociationService {
  createAssociation(associationDto: AssociationRequestDto, requestPrincipal: RequestPrincipal);

  updateAssociation(association: Association, updateInfo: UpdateAssociationDto): Promise<Association>;
}
