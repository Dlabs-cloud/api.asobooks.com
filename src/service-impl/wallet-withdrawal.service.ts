import { ForbiddenException, Injectable } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { WalletWithdrawal } from '../domain/entity/wallet-withdrawal.entity';
import { WalletRepository } from '../dao/wallet.repository';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Membership } from '../domain/entity/membership.entity';
import { Association } from '../domain/entity/association.entity';
import { WalletWithdrawalDto } from '../dto/wallet-withdrawal.dto';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from '../core/cron.enum';
import { Queue } from 'bull';
import { WalletWithdrawalSequence } from '../core/sequenceGenerators/wallet-withdrawal.sequence';
import { PaymentRequestService } from './payment-request.service';

@Injectable()
export class WalletWithdrawalService {

  constructor(private readonly connection: Connection,
              private readonly walletWithdrawalSequence: WalletWithdrawalSequence,
              private readonly authenticationUtils: AuthenticationUtils,
              private readonly paymentRequestService: PaymentRequestService,
              @InjectQueue(Queues.WALLET_WITHDRAWAL) private readonly walletWithDrawlQueue: Queue) {
  }

  withDraw(walletWithdrawal: WalletWithdrawal) {
    return this.paymentRequestService.payout(walletWithdrawal);
  }


  initiateWithdrawal(portalUser: PortalUser, membership: Membership, association: Association, walletInfo: WalletWithdrawalDto) {
    return this.authenticationUtils.comparePassword(walletInfo.password, portalUser.password)
      .then(isValid => {
        if (!isValid) {
          throw new IllegalArgumentException('Provided password is invalid');
        }
        return this.connection.transaction(entityManager => {
          return entityManager
            .getCustomRepository(WalletRepository)
            .findByAssociation(association)
            .then(wallet => {
              if (+walletInfo.amountInMinorUnit < +wallet.availableBalanceInMinorUnits) {
                throw new ForbiddenException('Wallet balance is less than the provided amount');
              }
              return this.walletWithdrawalSequence
                .next()
                .then(reference => {
                  const walletWithdrawal = new WalletWithdrawal();
                  walletWithdrawal.amountInMinorUnit = walletInfo.amountInMinorUnit;
                  walletWithdrawal.bankInfo = wallet.bank;
                  walletWithdrawal.initiatedBy = membership;
                  walletWithdrawal.reference = reference;
                  walletWithdrawal.wallet = wallet;
                  walletWithdrawal.description = `${association.name} Association withdrawal from wallet`;
                  return entityManager.save(walletWithdrawal);
                }).then(walletWithdrawal => {
                  return this.walletWithDrawlQueue.add({ id: walletWithdrawal.id })
                    .then(_ => {
                      return Promise.resolve(walletWithdrawal);
                    });
                });
            });
        });
      });


  }


}
