import { Injectable } from '@nestjs/common';
import { ServiceFeeRequestDto } from '../dto/service-fee-request.dto';
import { Association } from '../domain/entity/association.entity';
import { Connection, EntityManager } from 'typeorm';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { ServiceFeeCodeSequence } from '../core/sequenceGenerators/service-fee-code.sequence';
import * as moment from 'moment';
import { PortalUser } from '../domain/entity/portal-user.entity';
// import { SubscriptionService } from './subscription.service';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class ServiceFeeService {
  constructor(private readonly connection: Connection,
              private readonly eventBus: EventBus,
              // private readonly subscriptionService: SubscriptionService,
              private readonly serviceFeeCodeSequence: ServiceFeeCodeSequence) {
  }

  public async createService(serviceFeeRequestDto: ServiceFeeRequestDto,
                             association: Association,
                             recipients?: PortalUser[]) {
    return this.connection.transaction(async entityManager => {
      let serviceFee = new ServiceFee();
      serviceFee.association = association;
      serviceFee.amountInMinorUnit = serviceFeeRequestDto.amountInMinorUnit;
      serviceFee.code = await this.serviceFeeCodeSequence.next();
      serviceFee.cycle = serviceFeeRequestDto.cycle;
      serviceFee.name = serviceFeeRequestDto.name;
      serviceFee.type = serviceFeeRequestDto.type;
      serviceFee.description = serviceFeeRequestDto.description;
      serviceFee.firstBillingDate = moment(serviceFeeRequestDto.firstBillingDate, 'DD/MM/YYYY')
        .startOf('day')
        .toDate();
      serviceFee = await entityManager.save(serviceFee);
     // this.eventBus.publish(new ServiceFeeCreationEvent(serviceFee, recipients));
      return serviceFee;
    });

  }


}