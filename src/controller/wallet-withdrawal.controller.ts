import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { WalletWithdrawalRepository } from '../dao/wallet-withdrawal.repository';
import { ApiResponseDto } from '../dto/api-response.dto';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';

@Controller('withdrawals')
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
