import { Controller, Get } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { Connection } from 'typeorm/connection/Connection';
import { MembershipRepository } from '../dao/membership.repository';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { DashboardDto } from '../dto/dashboard.dto';
import { BillRepository } from '../dao/bill.repository';
import { WalletRepository } from '../dao/wallet.repository';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PaymentTransactionRepository } from '../dao/payment-transaction.repository';
import { PaymentTransactionHandler } from './handlers/payment-transaction.handler';
import { PaymentStatus } from '../domain/enums/payment-status.enum';

@Controller('/dashboard')
@AssociationContext()
export class DashboardController {

  constructor(private readonly connection: Connection,
              private readonly paymentTransactionHandler: PaymentTransactionHandler) {
  }


  @Get()
  dashBoardStarts(@RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    const association = requestPrincipal.association;
    const dashboardDto = new DashboardDto();
    return this.connection
      .getCustomRepository(MembershipRepository)
      .countByAssociationAndAccountTypeAndStatus(requestPrincipal.association, PortalAccountTypeConstant.MEMBER_ACCOUNT)
      .then(membershipCount => dashboardDto.numberOfMembers = membershipCount)
      .then(() => {
        return this.connection.getCustomRepository(BillRepository).sumTotalAmountByAssociationAndPaymentStatus(association)
          .then(billSum => dashboardDto.totalExpectedDueInMinorUnit = billSum)
          .then(() => {
            return this.connection.getCustomRepository(BillRepository).sumTotalAmountByAssociationAndPaymentStatus(association, PaymentStatus.NOT_PAID)
              .then(paidBillCount => dashboardDto.totalAmountReceivedInMinorUnit = paidBillCount)
              .then(() => {
                return this.connection.getCustomRepository(WalletRepository)
                  .findByAssociation(association)
                  .then(wallet => dashboardDto.walletBalanceInMinorUnit = wallet.availableBalanceInMinorUnits)
                  .then(() => {
                    return this.connection.getCustomRepository(PaymentTransactionRepository).findByAssociationTop(association, 10)
                      .then((paymentTransactions) => {
                        return this.paymentTransactionHandler.transform(paymentTransactions).then(paymentTransactions => dashboardDto.paymentTransactions = paymentTransactions);
                      }).then(() => {
                        return new ApiResponseDto(dashboardDto);
                      });
                  });

              });
          });
      });
  }
}