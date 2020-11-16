import { Controller, Get, Head, Inject, Param } from '@nestjs/common';
import { BankAccountVerification } from '../service/bank-account-verification';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('payments')
export class PaymentController {

  constructor(@Inject(BankAccountVerification) private readonly bankAccountVerificationService: BankAccountVerification) {
  }

  @Get('bank/:bankCode/account/:accountNumber/verify')
  verifyBankAccountNumber(@Param('bankCode') bankCode: string, @Param('accountNumber')accountNumber: string) {
    return this.bankAccountVerificationService
      .verifyBankAccount(accountNumber, bankCode)
      .then(accountDetails => {
        return new ApiResponseDto(accountDetails);
      });
  }
}