import { BaseRepository } from '../common/BaseRepository';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { EntityRepository } from 'typeorm';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PaymentTransactionSearchQueryDto } from '../dto/payment-transaction-search.query.dto';
import { of } from 'rxjs';

@EntityRepository(PaymentTransaction)
export class PaymentTransactionRepository extends BaseRepository<PaymentTransaction> {

  findByPaymentRequest(paymentRequest: PaymentRequest) {
    return this.findOne({
      paymentRequest: paymentRequest,
    });
  }


  findByAssociationAndQuery(association: Association, query: PaymentTransactionSearchQueryDto, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('paymentTransaction')
      .innerJoin(PaymentRequest, 'paymentRequest', 'paymentTransaction.paymentRequest = paymentRequest.id')
      .innerJoin(Association, 'association', 'paymentRequest.association = association.id')
      .where('association.id = :associationId')
      .andWhere('paymentTransaction.status = :status')
      .setParameter('associationId', association.id)
      .setParameter('status', status)
      .orderBy('paymentTransaction.id', 'DESC')
      .offset(query.offSet)
      .limit(query.limit)
      .getManyAndCount();
  }

}