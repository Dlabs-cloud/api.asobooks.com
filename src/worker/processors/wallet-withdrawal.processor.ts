import { Process, Processor } from '@nestjs/bull';
import { Queues } from '../../core/cron.enum';
import { Job } from 'bull';
import { EmailQueueDto } from '../../dto/email-queue.dto';
import { WalletWithdrawal } from '../../domain/entity/wallet-withdrawal.entity';
import { WalletService } from '../../service-impl/wallet.service';

@Processor(Queues.WALLET_WITHDRAWAL)
export class WalletWithdrawalProcessor {

  constructor(private readonly walletService: WalletService) {
  }

  @Process()
  handle(job: Job<WalletWithdrawal>) {
    const data = job.data;
    return this.walletService.withDraw(data);

  }
}
