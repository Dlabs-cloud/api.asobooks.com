import { Controller } from '@nestjs/common';
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
import { PaymentTransactionsDto } from '../dto/payment-transactions.dto';

@Controller('/dashboard')
@AssociationContext()
export class DashboardController {

  constructor(private readonly connection: Connection) {
  }

  dashBoardStarts(@RequestPrincipalContext() requestPrincipal: RequestPrincipal) {

    const association = requestPrincipal.association;
    return this.connection
      .getCustomRepository(MembershipRepository)
      .countByAssociationAndAccountTypeAndStatus(requestPrincipal.association, PortalAccountTypeConstant.MEMBER_ACCOUNT)
      .then(membershipCount => {
        const dashboardDto = new DashboardDto();
        dashboardDto.numberOfMembers = membershipCount;
        return Promise.resolve(dashboardDto);
      }).then((dashboardDto) => {
        return this.connection.getCustomRepository(BillRepository)
          .sumTotalAmountOnBills(association).then(billSum => {
            dashboardDto.totalExpectedDue = billSum;
            return Promise.resolve(dashboardDto);
          }).then(dashboardDto => {
            return this.connection.getCustomRepository(BillRepository)
              .sumTotalAmountOnBills(association).then(paidBillCount => {
                dashboardDto.totalAmountReceived = paidBillCount;
                return Promise.resolve(dashboardDto);
              });
          }).then(dashboardDto => {
            return this.connection.getCustomRepository(WalletRepository)
              .findByAssociation(association).then(wallet => {
                dashboardDto.walletBalanceInMinorUnit = wallet.availableBalanceInMinorUnits;
                return Promise.resolve(dashboardDto);
              });
          }).then(dashBoard => {
            return this.connection
              .getCustomRepository(PaymentTransactionRepository)
              .findByAssociationTop(association, 10).then((paymentTransactions) => {
                dashboardDto.paymentTransactions = paymentTransactions.map(paymentTransaction => {
                  const pTransaction: PaymentTransactionsDto = {
                    amountInMinorUnit: paymentTransaction.amountInMinorUnit,
                    membershipReference: '',
                    paidBy: '',
                    paymentDate: paymentTransaction.datePaid,
                    transactionReference: "",
                  };
                  return pTransaction;
                });
                return Promise.resolve(dashBoard);
              });
          }).then(dashboardDto => {
            return new ApiResponseDto(dashboardDto);
          });
      });
  }
}