import { Process, Processor } from '@nestjs/bull';
import { Queues } from '../../core/cron.enum';
import { Job } from 'bull';
import { WalletWithdrawalService } from '../../service-impl/wallet-withdrawal.service';
import { Connection } from 'typeorm/connection/Connection';
import { WalletWithdrawalRepository } from '../../dao/wallet-withdrawal.repository';

@Processor(Queues.WALLET_WITHDRAWAL)
export class WalletWithdrawalProcessor {

  constructor(private readonly walletWithdrawal: WalletWithdrawalService,
              private readonly connection: Connection) {
  }

  @Process()
  handle(job: Job<{ id: number }>) {
    const data = job.data.id;
    return this.process(data);
  }


  process(walletWithdrawal: number) {
    return this.connection
      .getCustomRepository(WalletWithdrawalRepository)
      .findOne({ id: walletWithdrawal }, {
        relations: [
          'wallet',
          'bankInfo',
          'bankInfo.bank',
        ],
      })
      .then(walletWithdrawal => {
        return this.walletWithdrawal.withDraw(walletWithdrawal);
      });

  }
}
