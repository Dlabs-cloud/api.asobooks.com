import { BaseRepository } from '../common/BaseRepository';
import { WalletTransaction } from '../domain/entity/wallet-transaction.entity';
import { Brackets, EntityRepository } from 'typeorm';
import { Association } from '../domain/entity/association.entity';
import { Wallet } from '../domain/entity/wallet.entity';
import { WalletTransactionQueryDto } from '../dto/wallet-transaction.query.dto';
import { Membership } from '../domain/entity/membership.entity';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import * as moment from 'moment';

@EntityRepository(WalletTransaction)
export class WalletTransactionRepository extends BaseRepository<WalletTransaction> {


  findByWalletAndQuery(wallet: Wallet, query: WalletTransactionQueryDto, status = GenericStatusConstant.ACTIVE) {
    const builder = this.createQueryBuilder('walletTransaction')
      .select()
      .innerJoinAndSelect('walletTransaction.initiatedBy', 'membership')
      .innerJoinAndSelect('walletTransaction.paymentTransaction', 'paymentTransaction')
      .innerJoinAndSelect('membership.membershipInfo', 'membershipInfo')
      .innerJoinAndSelect('membership.portalUser', 'portalUser')
      .where('walletTransaction.status = :status', { status });

    if (query.membershipIdentifier) {
      builder.andWhere('membershipInfo.identifier = :identifier', { identifier: query.membershipIdentifier });
    }

    if (query.minAmountInMinorUnit) {
      builder.andWhere('walletTransaction.amountInMinorUnit >= :minAmount', { minAmount: query.minAmountInMinorUnit });
    }

    if (query.maxAmountInMinorUnit) {
      builder.andWhere('walletTransaction.amountInMinorUnit <= :maxAmount', { maxAmount: query.maxAmountInMinorUnit });
    }

    if (query.dateCreatedAfter) {
      const date = moment(query.dateCreatedAfter, 'DD/MM/YYYY').startOf('day').toDate();
      builder.andWhere('walletTransaction.createdAt >= :afterDate', { afterDate: date });
    }

    if (query.dateCreatedBefore) {
      const date = moment(query.dateCreatedBefore, 'DD/MM/YYYY').endOf('day').toDate();
      builder.andWhere('walletTransaction.createdAt <= :beforeDate', { beforeDate: date });
    }

    if (query.type) {
      builder.andWhere('walletTransaction.paymentType = :paymentType', { paymentType: query.type });
    }

    builder.orderBy('walletTransaction.updatedAt', 'DESC');
    return builder.getManyAndCount();


  }

  findByStartDateAndEndDateWallet(startDate: Date, endDate: Date, wallet: Wallet) {
    return this
      .createQueryBuilder('walletTransaction')
      .select()
      .where('walletTransaction.wallet = :walletId', { walletId: wallet.id })
      .andWhere('walletTransaction.updatedAt >= :startDate', { startDate })
      .andWhere('walletTransaction.updatedAt <= :endDate', { endDate })
      .take(1)
      .getOne();
  }
}
