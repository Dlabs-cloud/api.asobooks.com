import { Module } from '@nestjs/common';
import { DaoModule } from '../dao/dao.module';
import { DomainModule } from '../domain/domain.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmDatasourceConf } from '../conf/data-source/type-orm-datasource-conf';
import { SubscriptionGeneratorProcessor } from './processors/subscription-generator.processor';
import { CronQueue } from '../core/cron.enum';
import { CoreModule } from '../core/core.module';
import { BullModule } from '@nestjs/bull';
import { ServiceModule } from '../service/service.module';
import { QueueDataStoreConf } from '../conf/data-source/queue-data-store-conf';
import { ConfModule } from '../conf/conf.module';
import { BillGeneratorProcessor } from './processors/bill-generator.processor';


@Module({
  imports: [
    ConfModule,
    BullModule.registerQueueAsync(...QueueDataStoreConf.createBullOptions()),
    DaoModule,
    ServiceModule,
    DomainModule,
  ],
  providers: [
    SubscriptionGeneratorProcessor,
    BillGeneratorProcessor
  ],
})
export class WorkerModule {

}
