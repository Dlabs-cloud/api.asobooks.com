import { Status } from '@dlabs/payment';

export class FlutterWaveWithdrawalResponseDto {
  status: Status;
  message: string;
  data: {
    id: string;
    account_number: string;
    bank_code: string;
    full_name: string;
    created_at: Date;
    currency: string;
    debit_currency: string;
    amount: number;
    fee: number;
    status: string;
    reference: string;
    meta?: any;
    narration: string;
    complete_message: string;
    requires_approval: number;
    is_approved: number;
    bank_name: string;
  };

}
