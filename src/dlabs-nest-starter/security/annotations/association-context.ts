import { SetMetadata } from '@nestjs/common';
import { AccessTypes } from '../accessTypes/access-types';

export const AssociationContext = () => SetMetadata(AccessTypes.ASSOCIATION, AccessTypes.ASSOCIATION);