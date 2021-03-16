import { Body, Controller, Get, Post } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { WalletService } from '../service-impl/wallet.service';
import { Connection } from 'typeorm/connection/Connection';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { WalletRepository } from '../dao/wallet.repository';
import { WalletBalanceResponseDto } from '../dto/wallet-balance.response.dto';
import { WalletTransactionRepository } from '../dao/wallet-transaction.repository';
import * as moment from 'moment';
import { MembershipRepository } from '../dao/membership.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { WalletWithdrawalDto } from '../dto/wallet-withdrawal.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('wallet')
@AssociationContext()
export class WalletController {

  constructor(private readonly walletService: WalletService,
              private readonly connection: Connection) {
  }

  @Get()
  get(@RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.connection
      .getCustomRepository(WalletRepository)
      .findByAssociation(requestPrincipal.association)
      .then(wallet => {
        const startDate = moment().startOf('month').toDate();
        const endDate = moment().endOf('month').toDate();
        return this.connection
          .getCustomRepository(WalletTransactionRepository)
          .findWalletByStartDateAndEndDateAssociation(startDate, endDate, requestPrincipal.association)
          .then(walletTransaction => {
            const walletBalanceForTheMonth = walletTransaction?.walletBalance || 0;
            const response: WalletBalanceResponseDto = {
              amountThisMonthInMinorUnit: walletBalanceForTheMonth,
              balanceInMinorUnit: wallet.availableBalanceInMinorUnits,
            };
            return Promise.resolve(response);
          });
      });
  }


  @Post()
  withdraw(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
           @Body() request: WalletWithdrawalDto) {
    return this.connection
      .getCustomRepository(MembershipRepository)
      .findByAssociationAndUserAndAccountType(requestPrincipal.association,
        requestPrincipal.portalUser,
        PortalAccountTypeConstant.EXECUTIVE_ACCOUNT)
      .then(membership => {
        return this.walletService
          .initiateWithdrawal(requestPrincipal.portalUser, membership, requestPrincipal.association, request)
          .then(walletWithdrawal => {
            return new ApiResponseDto(walletWithdrawal);
          });
      });
  }


}
