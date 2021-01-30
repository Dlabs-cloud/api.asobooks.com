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
import * as moment from 'moment';
import { getMonthDateRange } from '../common/useful-Utils';
import { ContributionGraphDto } from '../dto/contribution-graph-dto';


@Controller('/dashboard')
@AssociationContext()
export class DashboardController {

  constructor(private readonly connection: Connection,
              private readonly paymentTransactionHandler: PaymentTransactionHandler) {
  }


  @Get('contribution-graph')
  contributionGraph(@RequestPrincipalContext() requestPrincipal: RequestPrincipal, @Query('year') year: number) {
    year = year || moment().year();
    const contributionGraphDto = new ContributionGraphDto();
    const monthlyContributionPromise = [...Array(12).keys()].map(monthIndex => {
      const monthDateRange = getMonthDateRange(year, monthIndex + 1);
      return this.connection.getCustomRepository(BillRepository)
        .sumTotalBillByMonthRange(requestPrincipal.association, monthDateRange.start, monthDateRange.end).then(sum => {
          return Promise.resolve({ month: monthIndex, amountInMinorUnit: sum?.sum || 0 });
        });
    });

    return Promise.all(monthlyContributionPromise).then(monthlyContribution => {
      contributionGraphDto.monthlyContribution = monthlyContribution;
      const startOFTheYear = moment().startOf('year').toDate();
      const endOfTheYear = moment().endOf('year').toDate();
      return this.connection
        .getCustomRepository(BillRepository)
        .sumTotalBillByMonthRange(requestPrincipal.association, startOFTheYear, endOfTheYear)
        .then(sum => {
          contributionGraphDto.yearAmountInMinorUnit = sum?.sum || 0;
        }).then(() => {
          const startOfTheMonth = moment().startOf('month').toDate();
          const endOfTheMonth = moment().endOf('month').toDate();
          return this.connection
            .getCustomRepository(BillRepository)
            .sumTotalBillByMonthRange(requestPrincipal.association, startOfTheMonth, endOfTheMonth)
            .then(sum => {
              contributionGraphDto.monthAmountInMinorUnit = sum?.sum || 0;
            });
        }).then(() => {
          return new ApiResponseDto(contributionGraphDto);
        });

    });


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
          .then(billSum => dashboardDto.totalExpectedDueInMinorUnit = billSum ?? 0)
          .then(() => {
            return this.connection.getCustomRepository(BillRepository).sumTotalAmountByAssociationAndPaymentStatus(association, PaymentStatus.NOT_PAID)
              .then(paidBillCount => dashboardDto.totalAmountReceivedInMinorUnit = paidBillCount ?? 0)
              .then(() => {
                return this.connection.getCustomRepository(WalletRepository)
                  .findByAssociation(association)
                  .then(wallet => dashboardDto.walletBalanceInMinorUnit = wallet.availableBalanceInMinorUnits)
                  .then(() => {
                    return this.connection.getCustomRepository(PaymentTransactionRepository).findByAssociationAndQuery(association, {
                      limit: 10,
                      offset: 0,
                    })
                      .then((paymentTransactions) => {
                        return this.paymentTransactionHandler.transform(paymentTransactions[0]).then(paymentTransactions => dashboardDto.paymentTransactions = paymentTransactions);
                      }).then(() => {
                        return new ApiResponseDto(dashboardDto);
                      });
                  });

              });
          });
      });
  }


}