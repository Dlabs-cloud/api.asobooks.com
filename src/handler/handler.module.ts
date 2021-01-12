import {Module} from '@nestjs/common';
import {DaoModule} from '../dao/dao.module';
import {NewUserAccountSignUpHandler} from './new-user-account-sign-up-handler';
import {CqrsModule} from '@nestjs/cqrs';
import {ServiceImplModule} from '../service-impl/service-Impl.module';
import {ConfigModule} from '@nestjs/config';
import {ForgotPasswordHandler} from './forgot-password-handler';
import {ServiceModule} from '../service/service.module';
import {ConfModule} from '../conf/conf.module';
import {ActivityLogEventHandler} from "./activity-log-event-handler";

@Module({
    imports: [DaoModule, ServiceModule, ConfigModule, ConfModule],
    controllers: [],
    providers: [NewUserAccountSignUpHandler, ForgotPasswordHandler, ActivityLogEventHandler],
})
export class HandlerModule {

}