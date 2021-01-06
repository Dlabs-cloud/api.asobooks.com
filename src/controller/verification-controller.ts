import { Controller, Get, Head, Inject, NotFoundException, Param } from '@nestjs/common';
import { ApiResponseDto } from '../dto/api-response.dto';
import { BankService } from '../service-impl/bank.service';
import { Connection } from 'typeorm/connection/Connection';
import { BankRepository } from '../dao/bank.repository';

@Controller('verifications')
export class VerificationController {

  constructor(private readonly bankService: BankService, private readonly connection: Connection) {
  }

  @Get('banks/:code/account/:accountNumber/verify')
  verifyBankAccountNumber(@Param('code') code: string, @Param('accountNumber')accountNumber: string) {
    return this.connection.getCustomRepository(BankRepository).findByCode(code).then(bank => {
      if (!bank) {
        throw new NotFoundException(`Bank with code ${code} cannot be found`);
      }
      return this.bankService
        .verifyBankAccount(accountNumber, bank)
        .then(accountDetails => {
          return new ApiResponseDto(accountDetails);
        });
    });

  }
}