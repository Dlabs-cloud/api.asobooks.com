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
import { SubscriptionHandler } from './handlers/subscriptionHandler';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import { ServiceFeeQueryDto } from '../dto/service-fee-query.dto';
import { ServiceFeeResponseDto } from '../dto/service-fee.response.dto';

@Controller('service-fees')
@AssociationContext()
export class ServiceFeeController {

  constructor(private readonly serviceFeeService: ServiceFeeService,
              private readonly subscriptionHandler: SubscriptionHandler,
              private readonly connection: Connection) {
  }

  @Post()
  public async createService(@Body() serviceFeeRequestDto: ServiceFeeRequestDto,
                             @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {


    let recipients = serviceFeeRequestDto.recipients;
    let members: Membership[] = null;
    if (recipients) {
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
        const transformedServiceFee = serviceFees.map(serviceFee => {
          return ServiceFeeController.transformFees(serviceFee);
        });
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
    return new ApiResponseDto(ServiceFeeController.transformFees(serviceFee));
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
        const queryBuilder = this.connection.getCustomRepository(SubscriptionRepository)
          .createQueryBuilder('subscription')
          .select()
          .innerJoin(ServiceFee, 'serviceFee', 'subscription.serviceFee = serviceFee.id')
          .where('subscription.serviceFee = :serviceFee', { serviceFee: serviceFee.id })
          .limit(query.limit)
          .offset(query.offset);

        if (query.startDate) {
          queryBuilder.andWhere('subscription.startDate >= :date', { date: moment(query.startDate, 'DD/MM/YYYY') });
        }
        if (query.endDate) {
          queryBuilder.andWhere('subscription.endDate <= :date', { date: moment(query.endDate, 'DD/MM/YYYY') });
        }
        return queryBuilder.getManyAndCount().then(manyAndCount => {
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

  private static transformFees(serviceFee: ServiceFee) {
    return {
      amountInMinorUnit: serviceFee.amountInMinorUnit,
      billingStartDate: serviceFee.billingStartDate,
      code: serviceFee.code,
      cycle: serviceFee.cycle,
      description: serviceFee.description,
      dueDate: serviceFee.dueDate,
      name: serviceFee.name,
      status: serviceFee.status,
      nextBillingEndDate: serviceFee.nextBillingEndDate,
      nextBillingStartDate: serviceFee.nextBillingStartDate,
      type: serviceFee.type,
    };
  }
}