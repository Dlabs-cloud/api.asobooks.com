import { Controller, Get, Param, Query } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { PaymentRequestService } from '../service-impl/payment-request.service';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import { PaymentRequestDto } from '../dto/payment-request.dto';
import { Connection } from 'typeorm/connection/Connection';
import { PaymentTransactionRepository } from '../dao/payment-transaction.repository';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('payments')
@AssociationContext()
export class PaymentRequestController {

  constructor(private readonly connection: Connection, private readonly paymentRequestService: PaymentRequestService) {
  }

  // @Get('/:reference/validate')
  // validate(@Param('reference') reference: string) {
  //   return this.paymentRequestService.validatePayment(reference);
  // }

  @Get('confirm')
  confirmPayment(@Query() queryParam: ConfirmPaymentDto) {
    return this.paymentRequestService.confirmPayment(queryParam).then(paymentRequest => {
      return this.connection
        .getCustomRepository(PaymentTransactionRepository)
        .findByPaymentRequest(paymentRequest).then(paymentTransaction => {
          const response: PaymentRequestDto = {
            amountInMinorUnit: paymentRequest.amountInMinorUnit,
            description: paymentRequest.description,
            paymentProvider: paymentRequest.paymentProvider,
            paymentStatus: paymentRequest.paymentStatus,
            paymentType: paymentRequest.paymentType,
            reference: paymentRequest.reference,
            merchantReference: paymentRequest.merchantReference,
            amountPaidInMinorUnit: paymentRequest.amountPaidInMinorUnit,
            paymentTransactionId: paymentTransaction.id,
          };
          return new ApiResponseDto(response);
        });

    });
  }
}