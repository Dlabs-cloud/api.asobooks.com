import { BaseRepository } from '../common/BaseRepository';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { EntityRepository } from 'typeorm';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(PaymentTransaction)
export class PaymentTransactionRepository extends BaseRepository<PaymentTransaction> {

  findByPaymentRequest(paymentRequest: PaymentRequest) {
    return this.findOne({
      paymentRequest: paymentRequest,
    });
  }
  
  findByAssociationTop(association: Association, limit: number, status = GenericStatusConstant.ACTIVE) {
    limit = limit > 20 ? 20 : limit;
    return this.createQueryBuilder('paymentTransaction')
      .innerJoin(PaymentRequest, 'paymentRequest', 'paymentTransaction.paymentRequestId = paymentRequest.id')
      .innerJoin(Association, 'association', 'paymentRequest.associationId = association.id')
      .where('association.id = :associationId')
      .andWhere('paymentTransaction.status = :status')
      .setParameter('associationId', association.id)
      .setParameter('status', status)
      .orderBy('paymentTransaction.id', 'DESC')
      .limit(limit)
      .getMany();
  }
}