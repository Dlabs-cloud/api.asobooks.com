import { SetMetadata } from '@nestjs/common';
import { AccessTypes } from '../accessTypes/access-types';
import { PortalAccountTypeConstant } from '../../../domain/enums/portal-account-type-constant';

export const HasMembership = (...memberships: PortalAccountTypeConstant[]) => SetMetadata(AccessTypes.HAS_MEMBERSHIP, memberships);
