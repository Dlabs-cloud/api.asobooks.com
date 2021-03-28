import { Controller, Get, Query } from '@nestjs/common';
import { AssociationContext } from '../../dlabs-nest-starter/security/annotations/association-context';
import { RequestPrincipalContext } from '../../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../../dlabs-nest-starter/security/request-principal.service';
import { Connection } from 'typeorm/connection/Connection';
import { BillRepository } from '../../dao/bill.repository';
import { BillSearchQueryDto } from '../../dto/bill-search-query.dto';
import { MembershipRepository } from '../../dao/membership.repository';
import { PaginatedResponseDto } from '../../dto/paginated-response.dto';
import { ApiResponseDto } from '../../dto/api-response.dto';
import { SubscriptionRepository } from '../../dao/subscription.repository';
import { PortalAccountTypeConstant } from '../../domain/enums/portal-account-type-constant';
import { isEmpty } from '@nestjs/common/utils/shared.utils';


@Controller('member-workspace')
@AssociationContext()
export class BillsController {

  constructor(private readonly connection: Connection) {

  }

  @Get('bills')
  getBills(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
           @Query()query: BillSearchQueryDto) {

    query.limit = !isEmpty(query.limit) && (query.limit < 100) ? query.limit : 100;
    query.offset = !isEmpty(query.offset) && (query.offset < 0) ? query.offset : 0;

    return this.connection.getCustomRepository(MembershipRepository)
      .findByAssociationAndUserAndAccountType(requestPrincipal.association, requestPrincipal.portalUser, PortalAccountTypeConstant.MEMBER_ACCOUNT)
      .then(membership => {
        if (!membership) {
          return Promise.resolve([null, null]);
        }
        return this.connection.getCustomRepository(BillRepository).findByMembershipByQuery(membership, query);
      }).then(result => {
        let bills = result[0];
        if (bills.length) {
          return this.connection.getCustomRepository(SubscriptionRepository)
            .findByBills(...bills).then(subscriptions => {
              return bills.map(bill => {
                bill.subscription = subscriptions.find(subscription => {
                  return subscription.id === bill.subscriptionId;
                });
              });
            }).then(() => {
              return Promise.resolve(result);
            });
        }
        return Promise.resolve(result);
      }).then(result => {
        const paginatedResponse: PaginatedResponseDto<any> = {
          items: result[0] ?? [],
          itemsPerPage: query.limit,
          offset: query.offset,
          total: result[1] ?? 0,
        };
        return new ApiResponseDto(paginatedResponse, 200);
      });
  }
}
