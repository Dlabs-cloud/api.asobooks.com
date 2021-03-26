import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ServiceFeeRequestDto } from '../dto/service-fee-request.dto';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { ServiceFeeService } from '../service-impl/service-fee.service';
import { ApiResponseDto } from '../dto/api-response.dto';
import { Connection } from 'typeorm';
import { ServiceFeeRepository } from '../dao/service-fee.repository';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { MembershipRepository } from '../dao/membership.repository';
import { Membership } from '../domain/entity/membership.entity';
import { ServiceSubscriptionSearchQueryDto } from '../dto/service-subscription-search-query.dto';
import { SubscriptionRepository } from '../dao/subscription.repository';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import * as moment from 'moment';
import { SubscriptionHandler } from './handlers/subscription.handler';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import { ServiceFeeQueryDto } from '../dto/service-fee-query.dto';
import { ServiceFeeResponseDto } from '../dto/service-fee.response.dto';
import { ServiceFeeHandler } from './handlers/service-fee.handler';
import { BillRepository } from '../dao/bill.repository';
import { BillSearchQueryDto } from '../dto/bill-search-query.dto';
import { Bill } from '../domain/entity/bill.entity';
import { SubscriptionBillsResponseDto } from '../dto/subscription-bills-response.dto';
import { BillTransactionsHandler } from './handlers/bill-transactions.handler';
import { BillQueryDto } from '../dto/bill-query.dto';

@Controller('service-fees')
@AssociationContext()
export class ServiceFeeController {

  constructor(private readonly serviceFeeService: ServiceFeeService,
              private readonly subscriptionHandler: SubscriptionHandler,
              private readonly serviceFeeHandler: ServiceFeeHandler,
              private readonly billTransactionHandler: BillTransactionsHandler,
              private readonly connection: Connection) {
  }

  @Post()
  public async createService(@Body() serviceFeeRequestDto: ServiceFeeRequestDto,
                             @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {


    let recipients = serviceFeeRequestDto.recipients;
    let members: Membership[] = null;
    if (recipients && recipients.length) {
      members = await this.connection.getCustomRepository(MembershipRepository)
        .findByAssociationAndAccountTypeAndStatusAndIdentifiers(requestPrincipal.association,
          PortalAccountTypeConstant.MEMBER_ACCOUNT, GenericStatusConstant.ACTIVE,
          ...recipients);

    }

    let serviceFee = await this.serviceFeeService
      .createService(serviceFeeRequestDto, requestPrincipal.association, members);
    let response = { code: serviceFee.code };
    return new ApiResponseDto(response, 201);
  }


  @Get()
  public all(@Query()query: ServiceFeeQueryDto,
             @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    query.limit = !isEmpty(query.limit) && (query.limit < 100) ? query.limit : 100;
    query.offset = !isEmpty(query.offset) && (query.offset < 0) ? query.offset : 0;

    return this.connection.getCustomRepository(ServiceFeeRepository)
      .findByQueryAndAssociation(query, requestPrincipal.association)
      .then(serviceFeesAndCount => {
        const serviceFees = serviceFeesAndCount[0];
        const transformedServiceFee = this.serviceFeeHandler.transform(serviceFees);
        const response: PaginatedResponseDto<ServiceFeeResponseDto> = {
          items: transformedServiceFee,
          itemsPerPage: query.limit,
          offset: query.offset,
          total: serviceFeesAndCount[1],
        };
        return Promise.resolve(new ApiResponseDto(response, 200));
      });
  }

  @Delete('/:code')
  deActivateFee(@Param('code') code: string,
                @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.connection
      .getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(code, requestPrincipal.association)
      .then(serviceFee => {
        if (!serviceFee) {
          throw  new NotFoundException(`service fee with code ${code} cannot be found`);
        }
        return this.serviceFeeService
          .removeServiceFee(serviceFee)
          .then(() => {
            return new ApiResponseDto(null, 204);
          });
      });
  }

  @Get('/:code')
  public async getServiceByCode(@Param('code')code: string, @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    let serviceFee = await this.connection
      .getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(code, requestPrincipal.association);
    if (!serviceFee) {
      throw  new NotFoundException(`service fee with code ${code} cannot be found`);
    }
    return this.serviceFeeHandler.transformSingle(serviceFee).then(transformed => {
      return new ApiResponseDto(transformed);
    });

  }

  @Get('/:code/subscriptions')
  public getSubscriptions(@Param('code') code: string,
                          @Query() query: ServiceSubscriptionSearchQueryDto,
                          @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    query.limit = !isEmpty(query.limit) && (query.limit < 100) ? query.limit : 100;
    query.offset = !isEmpty(query.offset) && (query.offset < 0) ? query.offset : 0;
    return this.connection.getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(code, requestPrincipal.association)
      .then(serviceFee => {
        if (!serviceFee) {
          throw new NotFoundException(`ServiceFee with code ${code} cannot be found`);
        }
        return this.connection.getCustomRepository(SubscriptionRepository)
          .findByAndServiceFeeQuery(serviceFee, query)
          .then(manyAndCount => {
            const total = manyAndCount[1];
            const subscriptions = manyAndCount[0];
            return this.subscriptionHandler.transform(serviceFee, subscriptions).then(subscriptionSummaries => {
              const paginatedResponse: PaginatedResponseDto<any> = {
                items: subscriptionSummaries ?? [],
                itemsPerPage: query.limit,
                offset: query.offset,
                total: total,
              };
              return Promise.resolve(new ApiResponseDto(paginatedResponse, 200));
            });
          });

      });

  }

  @Get('/:code/bills')
  public getBills(@Param('code') code: string,
                  @Query() query: BillQueryDto,
                  @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    query.limit = !isEmpty(query.limit) && (query.limit < 100) ? query.limit : 100;
    query.offset = !isEmpty(query.offset) && (query.offset < 0) ? query.offset : 0;
    return this.connection.getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(code, requestPrincipal.association)
      .then(serviceFee => {
        if (!serviceFee) {
          throw new NotFoundException(`Service fee with code ${code} cannot be found`);
        }
        return this.connection.getCustomRepository(BillRepository).findByServiceFeeAndQuery(serviceFee, query)
          .then(billsTransactionsAndCount => {
            const billPaymentTransactionIds = (billsTransactionsAndCount[0]) as Map<Bill, number>;
            return this.billTransactionHandler.transform(billPaymentTransactionIds)
              .then(transformed => {
                const paginationRes: PaginatedResponseDto<SubscriptionBillsResponseDto> = {
                  items: transformed ?? [],
                  itemsPerPage: +query.limit,
                  offset: +query.offset,
                  total: billsTransactionsAndCount[1] as number,
                };
                const response = {
                  serviceFee,
                  queryData: paginationRes,
                };
                return new ApiResponseDto(response);
              });

          });
      });
  }


}
