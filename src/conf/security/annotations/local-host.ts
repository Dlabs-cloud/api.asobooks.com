// tslint:disable-next-line:variable-name
import {SetMetadata} from '@nestjs/common';
import {AccessTypes} from '../accessTypes/access-types';

// tslint:disable-next-line:variable-name
export const Localhost = () => SetMetadata(AccessTypes.LOCALHOST, AccessTypes.LOCALHOST);