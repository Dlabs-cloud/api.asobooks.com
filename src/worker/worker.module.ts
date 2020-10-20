import { Module } from '@nestjs/common';
import { DaoModule } from '../dao/dao.module';
import { DomainModule } from '../domain/domain.module';
import { ServiceImplModule } from '../service-impl/serviceImplModule';
import { ConfModule } from '../conf/conf.module';
import { EmailProcessor } from './processors/email.processor';
import { SubscriptionGeneratorProcessor } from './processors/subscription-generator.processor';
import { BillGeneratorProcessor } from './processors/bill-generator.processor';


@Module({
  imports: [
    ConfModule,
    DaoModule,
    ServiceImplModule,
    DomainModule,
  ],
  providers: [
    EmailProcessor,
    SubscriptionGeneratorProcessor,
    BillGeneratorProcessor,
  ],
})
export class WorkerModule {

}
