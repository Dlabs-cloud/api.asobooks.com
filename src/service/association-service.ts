import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';

export const ASSOCIATION_SERVICE = 'ASSOCIATION_SERVICE';
export const CACHE_ASSOCIATION_SERVICE = 'CACHE_ASSOCIATION_SERVICE';

export interface AssociationService {
  createAssociation(associationDto: AssociationRequestDto, requestPrincipal: RequestPrincipal);
}