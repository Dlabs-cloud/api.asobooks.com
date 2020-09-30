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


@Module({
  imports: [
    BullModule.registerQueue({
      name: CronQueue.SUBSCRIPTION,
      redis: {
        port: 6379,
        host: 'localhost',
      },
    }),
    DaoModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ormConfig = new TypeOrmDatasourceConf(configService);
        return ormConfig.getTypeOrmConfig();
      },
    }),
    DomainModule,
    CoreModule,
  ],
  providers: [
    SubscriptionGeneratorProcessor,
  ],
})
export class WorkerModule {

}
