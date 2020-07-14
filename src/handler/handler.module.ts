import { Module } from '@nestjs/common';
import { DaoModule } from '../dao/dao.module';
import { NewAccountSignUpHandler } from './new-account-sign-up-handler';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [DaoModule],
  controllers: [],
  providers: [NewAccountSignUpHandler],
})
export class HandlerModule {

}