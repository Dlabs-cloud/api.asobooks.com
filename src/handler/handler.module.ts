import { Module } from '@nestjs/common';
import { DaoModule } from '../dao/dao.module';
import { NewUserAccountSignUpHandler } from './new-user-account-sign-up-handler';
import { CqrsModule } from '@nestjs/cqrs';
import { ServiceModule } from '../service/service.module';
import { ConfigModule } from '@nestjs/config';
import { ForgotPasswordHandler } from './forgot-password-handler';

@Module({
  imports: [DaoModule, ServiceModule, ConfigModule],
  controllers: [],
  providers: [NewUserAccountSignUpHandler, ForgotPasswordHandler],
})
export class HandlerModule {

}