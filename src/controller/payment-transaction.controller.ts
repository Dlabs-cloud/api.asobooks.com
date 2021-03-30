import { Controller } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { Connection } from 'typeorm/connection/Connection';
import { PaymentTransactionHandler } from './handlers/payment-transaction.handler';

@Controller('payment-transactions')
@AssociationContext()
export class PaymentTransactionController {
  constructor(private readonly connection: Connection,
              private readonly paymentTransactionHandler: PaymentTransactionHandler) {
  }

  // @Get()
  // get(@RequestPrincipalContext()requestPrincipal: RequestPrincipal, @Query() query: PaymentTransactionSearchQueryDto) {
  //   query.limit = !isEmpty(query.limit) && (query.limit < 100) ? query.limit : 100;
  //   query.offset = !isEmpty(query.offset) && (query.offset < 0) ? query.offset : 0;
  //
  //   return this.connection.getCustomRepository(PaymentTransactionRepository)
  //     .findByAssociationAndQuery(requestPrincipal.association, query)
  //     .then(paymentsAndCount => {
  //       const paymentTransactions = paymentsAndCount[0];
  //       const count = paymentsAndCount[1];
  //       return this.paymentTransactionHandler
  //         .transform(paymentTransactions)
  //         .then(paymentTransactionResponse => {
  //           const response: PaginatedResponseDto<PaymentTransactionsDto> = {
  //             items: paymentTransactionResponse,
  //             itemsPerPage: query.limit,
  //             offset: query.offset,
  //             total: count,
  //           };
  //           return Promise.resolve(response);
  //         });
  //     });
  // }
  //

}
