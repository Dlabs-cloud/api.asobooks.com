import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { WalletWithdrawal } from '../domain/entity/wallet-withdrawal.entity';
import { WalletWithdrawalRepository } from '../dao/wallet-withdrawal.repository';
import * as Path from 'path';
import { ApiResponseDto } from '../dto/api-response.dto';
import { NestApplicationContext } from '@nestjs/core';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';

@Controller('withdrawal')
@AssociationContext()
export class WalletWithdrawalController {

  constructor(private readonly connection: Connection) {
  }

  @Get('/:reference')
  get(@Param('reference') reference: string) {
    return this.connection
      .getCustomRepository(WalletWithdrawalRepository)
      .findOne({
        reference,
      }).then(walletWithdrawal => {
        if (!walletWithdrawal) {
          throw new NotFoundException('Wallet withdrawal cannot be found');
        }
        return Promise.resolve(new ApiResponseDto(walletWithdrawal));
      });
  }
}
