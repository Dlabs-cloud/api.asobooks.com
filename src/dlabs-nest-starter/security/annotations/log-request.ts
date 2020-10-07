// tslint:disable-next-line:variable-name
import {SetMetadata} from '@nestjs/common';
import {AccessTypes} from '../accessTypes/access-types';

export const LOG = () => SetMetadata(AccessTypes.LOG, AccessTypes.LOG);