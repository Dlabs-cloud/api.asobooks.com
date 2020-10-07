import { Module } from '@nestjs/common';
import { DaoModule } from '../dao/dao.module';
import { DomainModule } from '../domain/domain.module';
import { BullModule } from '@nestjs/bull';
import { ServiceModule } from '../service/service.module';
import { QueueDataStoreConf } from '../conf/data-source/queue-data-store-conf';
import { ConfModule } from '../conf/conf.module';
import { EmailProcessor } from './processors/email.processor';


@Module({
  imports: [
    ConfModule,
    DaoModule,
    ServiceModule,
    DomainModule,
  ],
  providers: [
    EmailProcessor,
    // SubscriptionGeneratorProcessor,
    // BillGeneratorProcessor
  ],
})
export class WorkerModule {

}
