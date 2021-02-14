import { Injectable } from '@nestjs/common';
import { ServiceFee } from '../../domain/entity/service.fee.entity';
import { ServiceFeeResponseDto } from '../../dto/service-fee.response.dto';
import { Connection } from 'typeorm/connection/Connection';
import { BillRepository } from '../../dao/bill.repository';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { ServiceFeeDetailResponseDto } from '../../dto/service-fee-detail.response.dto';

@Injectable()
export class ServiceFeeHandler {

  constructor(private readonly connection: Connection) {
  }

  // @ts-ignore
  transform(serviceFees: ServiceFee[]) {
    return serviceFees.map(serviceFee => {
      const response: ServiceFeeResponseDto = {
        amountInMinorUnit: serviceFee.amountInMinorUnit,
        code: serviceFee.code,
        cycle: serviceFee.cycle,
        description: serviceFee.description,
        name: serviceFee.name,
        status: serviceFee.status,
        type: serviceFee.type,
      };
      return response;
    });
  }

  transformSingle(serviceFee: ServiceFee) {
    return this.connection
      .getCustomRepository(BillRepository)
      .countByServiceFeeAndPaymentStatus(serviceFee, PaymentStatus.PAID)
      .then(count => {
        const response: ServiceFeeDetailResponseDto = {
          amountInMinorUnit: serviceFee.amountInMinorUnit,
          amountRaisedInMinorUnit: +count * +serviceFee.amountInMinorUnit,
          billingStartDate: serviceFee.billingStartDate,
          code: serviceFee.code,
          cycle: serviceFee.cycle,
          description: serviceFee.description,
          dueDate: serviceFee.dueDate,
          name: serviceFee.name,
          nextBillingEndDate: serviceFee.nextBillingEndDate,
          nextBillingStartDate: serviceFee.nextBillingStartDate,
          status: serviceFee.status,
          type: serviceFee.type,
        };
        return Promise.resolve(response);
      });
  }
}