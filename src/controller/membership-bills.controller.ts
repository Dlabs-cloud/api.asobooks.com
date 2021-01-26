import { Controller, Get, Query } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { Connection } from 'typeorm/connection/Connection';
import { BillRepository } from '../dao/bill.repository';
import { BillSearchQueryDto } from '../dto/bill-search-query.dto';
import { MembershipRepository } from '../dao/membership.repository';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { SubscriptionRepository } from '../dao/subscription.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';

@Controller('/member-bills')
@AssociationContext()
export class MembershipBillsController {

  constructor(private readonly connection: Connection) {
  }

  @Get()
  getBills(@RequestPrincipalContext() requestPrincipal: RequestPrincipal, @Query()billSearchQuery: BillSearchQueryDto) {

    return this.connection.getCustomRepository(MembershipRepository)
      .findByAssociationAndUserAndAccountType(requestPrincipal.association, requestPrincipal.portalUser, PortalAccountTypeConstant.MEMBER_ACCOUNT)
      .then(membership => {
        return this.connection.getCustomRepository(BillRepository).findMembershipBillByQuery(membership, billSearchQuery);
      }).then(result => {
        let bills = result[0];
        if (bills) {
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
          items: result[0],
          itemsPerPage: billSearchQuery.limit,
          offset: billSearchQuery.offSet,
          total: result[1],
        };
        return new ApiResponseDto(paginatedResponse, 200);
      });
  }
}