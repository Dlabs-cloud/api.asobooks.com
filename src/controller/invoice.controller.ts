import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { InvoiceRequestDto } from '../dto/invoice.request.dto';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { InvoiceService } from '../service-impl/invoice.service';
import { Connection } from 'typeorm/connection/Connection';
import { MembershipRepository } from '../dao/membership.repository';
import { BillRepository } from '../dao/bill.repository';
import { InvoiceResponseDto } from '../dto/invoice.response.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { PaymentRequestService } from '../service-impl/payment-request.service';
import { InvoiceRepository } from '../dao/invoice.repository';

@Controller('invoice')
@AssociationContext()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService, private readonly connection: Connection,
              private readonly paymentRequestService: PaymentRequestService) {
  }


  @Get(':code/payment-request')
  getPaymentLink(@Param('code')invoiceCode: string, @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.connection
      .getCustomRepository(MembershipRepository)
      .findByUserAndAssociation(requestPrincipal.portalUser, requestPrincipal.association)
      .then(membership => {
        return this.connection.getCustomRepository(InvoiceRepository).findByCodeAndCreatedBy(invoiceCode, membership);
      }).then(invoice => {
        if (!invoice) {
          throw new NotFoundException('Invoice cannot be found');
        }
        return this.paymentRequestService.makePayment(invoice);
      }).then(paymentRequest => {
        return Promise.resolve(new ApiResponseDto(paymentRequest));
      });

  }

  @Post()
  createInvoice(@Body() request: InvoiceRequestDto, @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.connection.getCustomRepository(MembershipRepository)
      .findByUserAndAssociation(requestPrincipal.portalUser, requestPrincipal.association)
      .then(member => {
        return this.connection.getCustomRepository(BillRepository)
          .findByMembershipAndCode(member, ...request.billCodes).then(bills => {
            if (!bills.length) {
              throw new IllegalArgumentException('At least one bill code must exist');
            }
            return this.invoiceService.createInvoice(bills, member, requestPrincipal.association);
          });
      }).then(invoice => {
        const response: InvoiceResponseDto = {
          amount: invoice.amountInMinorUnit,
          amountPaid: invoice.amountPaidInMinorUnit,
          code: invoice.code,
          payableAmount: invoice.payableAmountInMinorUnit,
          paymentStatus: invoice.paymentStatus,
          surcharge: invoice.surchargeInMinorUnit,
        };
        return Promise.resolve(new ApiResponseDto(response, 201));
      });
  }
}