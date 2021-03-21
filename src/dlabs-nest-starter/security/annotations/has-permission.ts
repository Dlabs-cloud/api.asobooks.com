import { SetMetadata } from '@nestjs/common';
import { AccessTypes } from '../accessTypes/access-types';
import { PermissionEnum } from '../../../core/permission.enum';

export const HasPermission = (...permissions: PermissionEnum[]) => SetMetadata(AccessTypes.HAS_PERMISSION, permissions);
