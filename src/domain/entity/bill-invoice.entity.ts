import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Bill } from './bill.entity';
import { Invoice } from './invoice.entity';
import { BaseEntity } from '../../common/base.entity';

@Entity()
export class BillInvoice extends BaseEntity {
  @ManyToOne(() => Bill)
  @JoinColumn({ name: 'billId', referencedColumnName: 'id' })
  bill: Bill;

  @Column({
    nullable: true,
  })
  billId: number;

  @ManyToOne(() => Invoice, {
    eager: true,
  })
  invoice: Invoice;
}