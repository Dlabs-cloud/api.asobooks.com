import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { Invoice } from './invoice.entity';
import { Association } from './association.entity';
import { WalletWithdrawal } from './wallet-withdrawal.entity';
import { Membership } from './membership.entity';

@Entity()
export class PaymentRequest extends BaseEntity {

  @ManyToOne(() => Membership, { nullable: false })
  initiatedBy: Membership;

  @Column({
    type: 'bigint',
  })
  amountInMinorUnit: number;
  @Column({
    nullable: true,
  })
  merchantReference: string;
  @Column({
    unique: true,
  })
  reference: string;
  @Column()
  description: string;
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.NOT_PAID,

  })
  paymentStatus: PaymentStatus;
  @Column({
    type: 'enum',
    enum: PaymentProvider,

  })
  paymentProvider: PaymentProvider;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  paymentType: PaymentType;

  @ManyToOne(() => Invoice, {
    eager: true,
  })
  @JoinColumn({ name: 'invoiceId', referencedColumnName: 'id' })
  invoice: Invoice;

  @Column({
    nullable: true,
  })
  invoiceId: number;

  @ManyToOne(() => WalletWithdrawal, { eager: true })
  @JoinColumn({ name: 'walletWithdrawalId', referencedColumnName: 'id' })
  walletWithdrawal: WalletWithdrawal;

  @ManyToOne(() => Association, { eager: true })
  @JoinColumn({ name: 'associationId', referencedColumnName: 'id' })
  association: Association;

  @Column({
    nullable: true,
  })
  associationId: number;


  @Column({
    type: 'bigint',
    default: 0,
  })
  amountPaidInMinorUnit: number;

  @Column({ nullable: true })
  datePaid: Date;


}
