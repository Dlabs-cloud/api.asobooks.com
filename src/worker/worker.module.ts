import { Module } from '@nestjs/common';
import { DaoModule } from '../dao/dao.module';
import { DomainModule } from '../domain/domain.module';
import { ServiceImplModule } from '../service-impl/service-Impl.module';
import { ConfModule } from '../conf/conf.module';
import { EmailProcessor } from './processors/email.processor';
import { SubscriptionGeneratorProcessor } from './processors/subscription-generator.processor';
import { BillGeneratorProcessor } from './processors/bill-generator.processor';
import { WalletWithdrawal } from '../domain/entity/wallet-withdrawal.entity';
import { WalletWithdrawalProcessor } from './processors/wallet-withdrawal.processor';


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
    WalletWithdrawalProcessor,
  ],
})
export class WorkerModule {

}
