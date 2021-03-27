export class MembershipDashboardResponseDto {
  totalUnPaidBillsInMinorUnits: number;
  payments: MembershipPayments[];
}

export class MembershipPayments {
  name: string;
  amountPaidInMinorUnit: number;
  receiptNumber: string;
  paymentDate: Date | string;
}
