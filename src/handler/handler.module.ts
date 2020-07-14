import { Module } from '@nestjs/common';
import { DaoModule } from '../dao/dao.module';
import { NewAccountSignUpHandler } from './new-account-sign-up-handler';
import { CqrsModule } from '@nestjs/cqrs';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [DaoModule, ServiceModule],
  controllers: [],
  providers: [NewAccountSignUpHandler],
})
export class HandlerModule {

}