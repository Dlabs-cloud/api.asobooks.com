import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
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
import { WalletWithdrawalService } from '../service-impl/wallet-withdrawal.service';
import { HasMembership } from '../dlabs-nest-starter/security/annotations/has-membership';
import { PermissionEnum } from '../core/permission.enum';
import { HasPermission } from '../dlabs-nest-starter/security/annotations/has-permission';
import { WalletTransactionQueryDto } from '../dto/wallet-transaction.query.dto';
import { WalletTransactionResponseDto } from '../dto/wallet-transaction.response.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import { WalletTransactionHandler } from './handlers/wallet-transaction.handler';

@Controller('wallets')
@AssociationContext()
export class WalletController {

  constructor(private readonly walletWithdrawalService: WalletWithdrawalService,
              private readonly walletTransactionHandler: WalletTransactionHandler,
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
          .findByStartDateAndEndDateWallet(startDate, endDate, wallet)
          .then(walletTransaction => {
            const walletBalanceForTheMonth = walletTransaction?.walletBalanceInMinorUnit || 0;
            const response: WalletBalanceResponseDto = {
              amountThisMonthInMinorUnit: +walletBalanceForTheMonth,
              balanceInMinorUnit: +wallet.availableBalanceInMinorUnits,
            };
            return Promise.resolve(new ApiResponseDto(response));
          });
      });


  }


  @Get('/transactions')
  getWalletTransaction(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                       @Query() query: WalletTransactionQueryDto) {
    query.limit = !isEmpty(query.limit) && (query.limit < 100) ? query.limit : 100;
    query.offset = !isEmpty(query.offset) && (query.offset < 0) ? query.offset : 0;
    return this.connection
      .getCustomRepository(WalletRepository)
      .findByAssociation(requestPrincipal.association)
      .then(wallet => {
        return this.connection.getCustomRepository(WalletTransactionRepository)
          .findByWalletAndQuery(wallet, query)
          .then(walletTransactions => {
            const payload = walletTransactions[0]
              .map(this.walletTransactionHandler.transform);
            const response = new PaginatedResponseDto<WalletTransactionResponseDto>();
            response.items = payload;
            response.itemsPerPage = query.limit;
            response.offset = query.limit;
            response.total = walletTransactions[1] || 0;
            return response;
          }).then(response => {
            return new ApiResponseDto(response);
          });
      });
  }


  @Post()
  @HasMembership(PortalAccountTypeConstant.EXECUTIVE_ACCOUNT)
  // @HasPermission(PermissionEnum.CAN_WITHDRAW_FROM_WALLET)
  withdraw(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
           @Body() request: WalletWithdrawalDto) {
    return this.connection
      .getCustomRepository(MembershipRepository)
      .findByAssociationAndUserAndAccountType(requestPrincipal.association,
        requestPrincipal.portalUser,
        PortalAccountTypeConstant.EXECUTIVE_ACCOUNT)
      .then(membership => {
        return this.walletWithdrawalService
          .initiateWithdrawal(requestPrincipal.portalUser, membership, requestPrincipal.association, request)
          .then(walletWithdrawal => {
            return new ApiResponseDto({ reference: walletWithdrawal.reference }, 201);
          });
      });
  }


}
