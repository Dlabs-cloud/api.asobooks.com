import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { Connection } from 'typeorm/connection/Connection';
import { SubscriptionRepository } from '../dao/subscription.repository';
import { BillRepository } from '../dao/bill.repository';
import { BillSearchQueryDto } from '../dto/bill-search-query.dto';
import { SubscriptionBillsResponseDto } from '../dto/subscription-bills-response.dto';
import { SubscriptionBillHandler } from './handlers/subscription-bill.handler';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { SubscriptionBillQueryDto } from '../dto/subscription-bill-query.dto';

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
            const bills = billsAndCount[0];
            return this.subscriptionHandler.transform(bills).then(subBills => {
              const response: PaginatedResponseDto<SubscriptionBillsResponseDto> = {
                items: subBills,
                itemsPerPage: query.limit,
                offset: query.offset,
                total: billsAndCount[1],
              };
              return Promise.resolve(new ApiResponseDto(response));
            });
          });
      });
  }
}