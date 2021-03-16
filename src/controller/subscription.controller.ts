import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { Connection } from 'typeorm/connection/Connection';
import { SubscriptionRepository } from '../dao/subscription.repository';
import { BillRepository } from '../dao/bill.repository';
import { SubscriptionBillsResponseDto } from '../dto/subscription-bills-response.dto';
import { BillTransactionsHandler } from './handlers/bill-transactions.handler';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { BillQueryDto } from '../dto/bill-query.dto';
import { Bill } from '../domain/entity/bill.entity';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import { ServiceFeeRepository } from '../dao/service-fee.repository';

@Controller('subscriptions')
@AssociationContext()
export class SubscriptionController {

  constructor(private readonly connection: Connection,
              private readonly subscriptionHandler: BillTransactionsHandler) {
  }

  @Get('/:code')
  get(@Param('code')code: string,
      @Query()query: BillQueryDto,
      @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    query.limit = !isEmpty(query.limit) && (query.limit < 100) ? query.limit : 100;
    query.offset = !isEmpty(query.offset) && (query.offset < 0) ? query.offset : 0;
    return this.connection
      .getCustomRepository(SubscriptionRepository)
      .findOne({ code: code })
      .then(subscription => {
        if (!subscription) {
          throw new NotFoundException(`Subscription with code ${code} cannot be found`);
        }
        return this.connection.getCustomRepository(ServiceFeeRepository)
          .findOne({ id: subscription.serviceFeeId }).then(serviceFee => {
            return this.connection.getCustomRepository(BillRepository)
              .findBySubscriptionAndQuery(subscription, query)
              .then(billsAndCount => {
                const billPaymentTransactionIds = (billsAndCount[0]) as Map<Bill, number>;
                return this.subscriptionHandler.transform(billPaymentTransactionIds)
                  .then(transformed => {
                    const paginationRes: PaginatedResponseDto<SubscriptionBillsResponseDto> = {
                      items: transformed ?? [],
                      itemsPerPage: +query.limit,
                      offset: +query.offset,
                      total: billsAndCount[1] as number,
                    };
                    const response = {
                      serviceFee,
                      queryData: paginationRes,
                    };
                    return new ApiResponseDto(response);
                  });

              });
          });
      });


  }

}
