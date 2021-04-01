import { PaymentType } from '../domain/enums/payment-type.enum';
import { PortalUserDto } from './portal-user.dto';

export class WalletTransactionResponseDto {
  date: Date;
  transactionReference: string;
  amountInMinorUnit: number;
  initiatedBy: PortalUserDto;
  previousWalletBalanceInMinorUnit: number;
  walletBalanceInMinorUnit: number;
  paymentType: PaymentType;
}
