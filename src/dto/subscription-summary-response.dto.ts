export class SubscriptionSummaryResponseDto {
  amountReceivedInMinorUnit: number;
  amountPendingInMinorUnit: number;
  countNumberOfPaid: number;
  countNumberOfPending: number;
  startDate: Date;
  endDate: Date;
  code: string;
  id: number;
}