import { IsNumber, IsString, Min } from 'class-validator';

export class WalletWithdrawalDto {
  @IsNumber()
  @Min(1)
  amountInMinorUnit: number;
  @IsString()
  password: string;
}
