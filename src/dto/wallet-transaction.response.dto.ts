import { PaymentType } from '../domain/enums/payment-type.enum';
import { PortalUserDto } from './portal-user.dto';

export class WalletTransactionResponseDto {
  date: Date;
  transactionReference: string;
  amount: number;
  initiatedBy: PortalUserDto;
  previousWalletBalance: number;
  walletBalance: number;
  paymentType: PaymentType;
}
