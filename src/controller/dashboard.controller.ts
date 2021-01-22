import { Controller, Get, Query } from '@nestjs/common';
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
import { ActivityLogRepository } from '../dao/activity-log.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { ActivityLogDto } from '../dto/activity-log.dto';

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
        return this.connection.getCustomRepository(BillRepository).sumTotalAmountOnBills(association)
          .then(billSum => dashboardDto.totalExpectedDue = billSum)
          .then(() => {
            return this.connection.getCustomRepository(BillRepository).sumTotalAmountOnBills(association, PaymentStatus.NOT_PAID)
              .then(paidBillCount => dashboardDto.totalAmountReceived = paidBillCount)
              .then(() => {
                return this.connection.getCustomRepository(WalletRepository)
                  .findByAssociation(association)
                  .then(wallet => dashboardDto.walletBalanceInMinorUnit = wallet.availableBalanceInMinorUnits)
                  .then(() => {
                    return this.connection.getCustomRepository(PaymentTransactionRepository).findByAssociationTop(association, 10)
                      .then((paymentTransactions) => {
                        return this.paymentTransactionHandler.transform(paymentTransactions).then(paymentTransactions => dashboardDto.paymentTransactions = paymentTransactions);
                      }).then(() => {
                        console.log(dashboardDto);
                        return new ApiResponseDto(dashboardDto);
                      });
                  });

              });
          });
      });
  }


}