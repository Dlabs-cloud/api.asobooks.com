import { Get } from '@nestjs/common';
import { RequestPrincipalContext } from '../../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../../dlabs-nest-starter/security/request-principal.service';
import { Connection } from 'typeorm/connection/Connection';
import { MembershipRepository } from '../../dao/membership.repository';
import { PortalAccountTypeConstant } from '../../domain/enums/portal-account-type-constant';
import { BillRepository } from '../../dao/bill.repository';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { BillTransactionsHandler } from '../handlers/bill-transactions.handler';
import { Bill } from '../../domain/entity/bill.entity';
import { MembershipBills } from '../../dto/membership.bills';
import { ApiResponseDto } from '../../dto/api-response.dto';
import { MembershipDashboardResponseDto, MembershipPayments } from '../../dto/membership-dashboard.response.dto';


export class DashboardController {

  constructor(private readonly connection: Connection,
              private readonly billTransactionHandler: BillTransactionsHandler) {

  }

  @Get('/dashboard')
  dashBoard(@RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    this.connection.getCustomRepository(MembershipRepository)
      .findByAssociationAndUserAndAccountType(requestPrincipal.association, requestPrincipal.portalUser, PortalAccountTypeConstant.MEMBER_ACCOUNT)
      .then(membership => {
        const billRepository = this.connection
          .getCustomRepository(BillRepository);
        return billRepository
          .sumByMembershipAndPaymentStatus(membership, PaymentStatus.NOT_PAID)
          .then(totalUnPaidBills => {
            totalUnPaidBills = totalUnPaidBills || 0;
            return billRepository.findByMembershipAndQuery(membership, {
              paymentStatus: PaymentStatus.PAID,
              limit: 10,
              offset: 0,
            }).then(billsAndCount => {
              const billPaymentTransactionIds = (billsAndCount[0]) as Map<Bill, number>;
              return this.billTransactionHandler.transform(billPaymentTransactionIds)
                .then((transformed: MembershipBills[]) => {
                  const payments = transformed.map(data => {
                    const res: MembershipPayments = {
                      amountPaidInMinorUnit: +data.amountInMinorUnit,
                      name: data.billName,
                      paymentDate: data.paymentDate,
                      receiptNumber: data.transactionReference,
                    };
                    return res;
                  });

                  const response: MembershipDashboardResponseDto = {
                    payments: payments,
                    totalUnPaidBillsInMinorUnits: totalUnPaidBills,

                  };
                  return new ApiResponseDto(response);
                });
            });
          });

      });
  }
}
