import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { Connection } from 'typeorm/connection/Connection';
import { SubscriptionRepository } from '../dao/subscription.repository';
import { BillRepository } from '../dao/bill.repository';
import { SubscriptionBillsResponseDto } from '../dto/subscription-bills-response.dto';
import { SubscriptionBillHandler } from './handlers/subscription-bill.handler';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { SubscriptionBillQueryDto } from '../dto/subscription-bill-query.dto';
import { Bill } from '../domain/entity/bill.entity';

@Controller('subscriptions')
@AssociationContext()
export class SubscriptionController {

  constructor(private readonly connection: Connection,
              private readonly subscriptionHandler: SubscriptionBillHandler) {
  }

  @Get(':code')
  get(@Param('code')code: string,
      @Query()query: SubscriptionBillQueryDto,
      @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.connection
      .getCustomRepository(SubscriptionRepository)
      .findOne({ code: code }).then(subscription => {
        if (!subscription) {
          throw new NotFoundException(`Subscription with code ${code} cannot be found`);
        }
        return this.connection.getCustomRepository(BillRepository)
          .findBySubscriptionAndQuery(subscription, query)
          .then(billsAndCount => {
            const billPaymentTransactionIds = (billsAndCount[0]) as Map<Bill, number>;
            return this.subscriptionHandler.transform(billPaymentTransactionIds)
              .then(transformed => {
                const paginationRes: PaginatedResponseDto<SubscriptionBillsResponseDto> = {
                  items: transformed,
                  itemsPerPage: +query.limit,
                  offset: +query.offset,
                  total: billsAndCount[1] as number,
                };
                return new ApiResponseDto(paginationRes);
              });

          });
      });


  }

}