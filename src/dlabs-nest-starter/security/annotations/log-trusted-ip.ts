import {applyDecorators, SetMetadata} from '@nestjs/common';
import {AccessTypes} from '../accessTypes/access-types';

export function LogTrustedIp(lookUpColumn: string = 'trusted_ip_address') {
    return applyDecorators(
        SetMetadata(AccessTypes.PUBLIC, AccessTypes.PUBLIC),
        SetMetadata(AccessTypes.TRUSTED_IP, lookUpColumn),
        SetMetadata(AccessTypes.LOG, AccessTypes.LOG),
    );
}