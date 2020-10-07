import {SetMetadata} from '@nestjs/common';
import {AccessTypes} from '../accessTypes/access-types';

// tslint:disable-next-line:variable-name
export const Public = () => SetMetadata(AccessTypes.PUBLIC, AccessTypes.PUBLIC);
