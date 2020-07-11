import {CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException} from '@nestjs/common';
import {Observable} from 'rxjs';
import {Reflector} from '@nestjs/core';
import {AccessTypes} from '../accessTypes/access-types';
import {SettingRepository} from '../../../dao/setting.repository';
import {Connection} from 'typeorm';

@Injectable()
export class RemoteAddressInterceptor implements NestInterceptor {

    constructor(private readonly reflector: Reflector,
                private connection: Connection) {
    }

    // @ts-ignore
    async intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {

        const request = context.switchToHttp().getRequest();
        const ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        const settingsColumn: string[] = this.reflector.getAllAndMerge(AccessTypes.TRUSTED_IP, [
            context.getHandler(), context.getClass(),
        ]);
        const localHostAnnotation = this.reflector.getAllAndMerge(AccessTypes.LOCALHOST, [
            context.getHandler(), context.getClass(),
        ]);
        let annotations = settingsColumn.concat(localHostAnnotation);
        annotations = annotations.filter(column => column);
        if (Array.isArray(annotations) && annotations.length) {
            if (annotations.includes(AccessTypes.LOCALHOST)) {
                if (ipAddress === ('127.0.0.1' || '0:0:0:0:0:0:0:1' || '::1' || '::ffff:127.0.0.1')) {
                    return next.handle();
                }
            }

            const settingRepository = this.connection.getCustomRepository(SettingRepository);
            const whiteListedIp = (await settingRepository.findInLabels(...annotations)).map(setting => {
                return setting.value.split(',');
            }).flat();
            console.log(whiteListedIp);
            if (whiteListedIp.includes(ipAddress)) {
                return next.handle();
            }
            throw new UnauthorizedException('Authorized to access routes');
        }

        return next.handle();
    }

}
