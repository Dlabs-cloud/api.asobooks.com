import { Controller, Get, Query } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { PaymentTransactionSearchQueryDto } from '../dto/payment-transaction-search.query.dto';
import { Connection } from 'typeorm/connection/Connection';
import { PaymentTransactionRepository } from '../dao/payment-transaction.repository';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { PaymentTransactionHandler } from './handlers/payment-transaction.handler';
import { PaymentTransactionsDto } from '../dto/payment-transactions.dto';

@Controller('payment-transactions')
@AssociationContext()
export class PaymentTransactionController {
  constructor(private readonly connection: Connection,
              private readonly paymentTransactionHandler: PaymentTransactionHandler) {
  }

  @Get()
  get(@RequestPrincipalContext()requestPrincipal: RequestPrincipal, @Query() query: PaymentTransactionSearchQueryDto) {
    query.limit = query.limit > 20 ? 20 : query.limit;
    query.offSet = query.offSet < 0 ? 0 : query.offSet;
    return this.connection.getCustomRepository(PaymentTransactionRepository)
      .findByAssociationAndQuery(requestPrincipal.association, query)
      .then(paymentsAndCount => {
        const paymentTransactions = paymentsAndCount[0];
        const count = paymentsAndCount[1];
        return this.paymentTransactionHandler
          .transform(paymentTransactions)
          .then(paymentTransactionResponse => {
            const response: PaginatedResponseDto<PaymentTransactionsDto> = {
              items: paymentTransactionResponse,
              itemsPerPage: query.limit,
              offset: query.offSet,
              total: count,
            };
            return Promise.resolve(response);
          });
      });
  }
}