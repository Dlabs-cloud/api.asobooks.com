export class FlutterWaveWithdrawalDto {
  account_bank: string;
  account_number: string;
  amount: number;
  narration: string;
  currency?: string = 'NGN';
  reference: string;
  beneficiary_name: string;
}
