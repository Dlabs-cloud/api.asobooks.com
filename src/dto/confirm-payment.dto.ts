import { IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  reference: string;
  @IsString()
  merchantReference: string;
}