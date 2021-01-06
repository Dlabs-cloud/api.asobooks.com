import { IsArray } from 'class-validator';

export class InvoiceRequestDto {
  @IsArray()
  billCodes: string[];
}