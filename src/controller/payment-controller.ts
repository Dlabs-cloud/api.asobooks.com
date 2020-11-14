import { Controller, Get, Head, Inject, Param } from '@nestjs/common';
import { BankAccountVerification } from '../service/bank-account-verification';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('payments')
export class PaymentController {

  constructor(@Inject(BankAccountVerification) private readonly bankAccountVerificationService: BankAccountVerification) {
  }

  @Get('bank-accounts/:number/verify')
  verifyBankAccountNumber(@Param('number')accountNumber: string) {
    return this.bankAccountVerificationService
      .verifyBankAccount(accountNumber)
      .then(accountDetails => {
        return new ApiResponseDto(accountDetails);
      });
  }
}