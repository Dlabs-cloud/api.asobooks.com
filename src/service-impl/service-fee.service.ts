import { Injectable } from '@nestjs/common';
import { ServiceFeeRequestDto } from '../dto/service-fee-request.dto';
import { Association } from '../domain/entity/association.entity';
import { Connection } from 'typeorm';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { ServiceFeeCodeSequence } from '../core/sequenceGenerators/service-fee-code.sequence';
import * as moment from 'moment';
// import { SubscriptionService } from './subscription.service-impl';
import { EventBus } from '@nestjs/cqrs';
import { BillingCycleConstant } from '../domain/enums/billing-cycle.constant';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { GroupService } from './group.service';
import { GroupRepository } from '../dao/group.repository';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { GroupServiceFeeService } from './group-service-fee.service';
import { Membership } from '../domain/entity/membership.entity';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';

@Injectable()
export class ServiceFeeService {
  constructor(private readonly connection: Connection,
              private readonly eventBus: EventBus,
              private readonly groupService: GroupService,
              private readonly groupServiceFeeService: GroupServiceFeeService,
              private readonly serviceFeeCodeSequence: ServiceFeeCodeSequence) {
  }

  public async createService(serviceFeeRequestDto: ServiceFeeRequestDto,
                             association: Association,
                             recipients?: Membership[]) {
    return this.connection.transaction(async entityManager => {
      let serviceFee = new ServiceFee();
      serviceFee.association = association;
      serviceFee.amountInMinorUnit = serviceFeeRequestDto.amountInMinorUnit;
      serviceFee.code = await this.serviceFeeCodeSequence.next();
      serviceFee.cycle = serviceFeeRequestDto.cycle;
      serviceFee.name = serviceFeeRequestDto.name;
      serviceFee.type = serviceFeeRequestDto.type;
      serviceFee.description = serviceFeeRequestDto.description;
      serviceFee.billingStartDate = moment(serviceFeeRequestDto.billingStartDate, 'DD/MM/YYYY')
        .startOf('day')
        .toDate();
      if (ServiceTypeConstant.ONE_TIME === serviceFee.type) {
        if (serviceFeeRequestDto.dueDate) {
          serviceFee.dueDate = moment(serviceFeeRequestDto.dueDate, 'DD/MM/YYYY')
            .endOf('day')
            .toDate();
        }
        serviceFee.cycle = BillingCycleConstant.ONE_OFF;
      } else {
        serviceFee.nextBillingStartDate = serviceFee.billingStartDate;
        serviceFee.nextBillingEndDate = this.calculateNextBillingDate(serviceFee.billingStartDate, serviceFee.cycle);
      }

      serviceFee = await entityManager.save(serviceFee);

      let group = await this.groupService.createGroup(entityManager, {
        association: association,
        name: `${serviceFee.name}-${serviceFee.type}`,
        type: GroupTypeConstant.SERVICE_FEE,
      });

      return this.groupServiceFeeService
        .createGroupForService(entityManager, group, serviceFee)
        .then(_ => {
          if (!recipients || !recipients.length) {
            return Promise.resolve(serviceFee);
          }
          return this.groupService.addMember(entityManager, group, ...recipients)
            .then(_ => {
              return Promise.resolve(serviceFee);
            });
        });
    });

  }


  public calculateNextBillingDate(date: Date, cycle: BillingCycleConstant) {
    switch (cycle) {
      case BillingCycleConstant.YEARLY:
        return moment(date)
          .startOf('day')
          .add(1, 'year')
          .toDate();
      case BillingCycleConstant.WEEKLY:
        return moment(date)
          .startOf('day')
          .add(1, 'week')
          .toDate();
      case BillingCycleConstant.QUARTERLY:
        return moment(date)
          .add(1, 'quarter')
          .toDate();
      case BillingCycleConstant.MONTHLY:
        return moment(date)
          .add(1, 'month')
          .startOf('day')
          .toDate();
      case BillingCycleConstant.BI_WEEKLY:
        return moment(date)
          .add(14, 'days')
          .startOf('day')
          .toDate();
      default:
        throw new IllegalArgumentException('cycle should be specified');

    }
  }

}