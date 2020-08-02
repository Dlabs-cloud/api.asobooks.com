import { Injectable } from '@nestjs/common';
import { ServiceFeeRequestDto } from '../dto/service-fee-request.dto';
import { Association } from '../domain/entity/association.entity';
import { Connection } from 'typeorm';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { ServiceFeeCodeSequence } from '../core/sequenceGenerators/service-fee-code.sequence';
import * as moment from 'moment';

@Injectable()
export class ServiceFeeService {
  constructor(private readonly connection: Connection,
              private readonly serviceFeeCodeSequence: ServiceFeeCodeSequence) {
  }

  public async createService(serviceFeeRequestDto: ServiceFeeRequestDto, association: Association) {
    return this.connection.transaction(async entityManager => {
      let serviceFee = new ServiceFee();
      serviceFee.association = association;
      serviceFee.amountInMinorUnit = serviceFeeRequestDto.amountInMinorUnit;
      serviceFee.code = await this.serviceFeeCodeSequence.next();
      serviceFee.cycle = serviceFeeRequestDto.cycle;
      serviceFee.name = serviceFeeRequestDto.name;
      serviceFee.type = serviceFeeRequestDto.type;
      serviceFee.description = serviceFeeRequestDto.description;
      let todaysDate = moment(serviceFeeRequestDto.firstBillingDate, 'DD/MM/YYYY').startOf('day').toDate();
      serviceFee.firstBillingDate = todaysDate;
      serviceFee.nextBillingDate = todaysDate;
      return entityManager.save(serviceFee);
    });

  }
}