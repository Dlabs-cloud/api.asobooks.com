export class ContributionGraphDto {
  monthAmountInMinorUnit: number;
  yearAmountInMinorUnit: number;
  monthlyContribution: { month: number, amountInMinorUnit: number }[];
}