import {Module} from '@nestjs/common';
import {CoreModule} from '../core/core.module';
import {WinstonModule} from 'nest-winston';
import {APP_INTERCEPTOR} from '@nestjs/core';
import * as winston from 'winston';
import {LoggerInterceptor} from './security/interceptors/logger.interceptor';
import {AccessConstraintInterceptor} from './security/interceptors/access-constraint.interceptor';
import {RemoteAddressInterceptor} from './security/interceptors/remote-address.interceptor';
import {CommonModule} from '../common/common.module';
import {DaoModule} from '../dao/dao.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TypeOrmDatasource} from './data-source/type-orm-datasource';
import {Principal} from './security/principal';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const typeOrmDatasource = new TypeOrmDatasource(configService);
                return typeOrmDatasource.getTypeOrmConfig();
            },
        }),
        CoreModule,
        CommonModule,
        DaoModule,
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({format: winston.format.json()}),
            ],
        })],
    exports: [Principal],
    providers: [
        Principal,
        {
            provide: APP_INTERCEPTOR,
            useExisting: AccessConstraintInterceptor,
        },
        AccessConstraintInterceptor,
        {
            provide: APP_INTERCEPTOR,
            useExisting: RemoteAddressInterceptor,
        },
        RemoteAddressInterceptor,
        {
            provide: APP_INTERCEPTOR,
            useExisting: LoggerInterceptor,
        },
        LoggerInterceptor,
    ],
})
export class ConfModule {
    static get environment(): string {
        return process.env.ENV ?? '';
    }
}
