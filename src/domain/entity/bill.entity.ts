import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Subscription } from './subcription.entity';
import { Address } from './address.entity';
import { PortalUser } from './portal-user.entity';
import { ServiceFee } from './service.fee.entity';

@Entity()
export class Bill extends BaseEntity {

  @Column()
  code: string;
  @Column()
  membershipRef: string;
  @Column()
  receiverName: string;
  @Column()
  receiverAddress: string;
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  previousPayDate: Date;
  @Column()
  previousPayAmountInMinorUnit: number;
  @Column()
  netArrears: number;
  @Column()
  currentAmountInMinorUnit: number;
  @Column()
  description: string;
  @Column({
    nullable: true,
  })
  vatInPercentage: number;
  @Column({
    nullable: true,
  })
  disCountInPercentage: number;
  @Column()
  payableAmountInMinorUnit: number;
  @Column()
  totalAmountPaidInMinorUnit: number;
  @ManyToOne(() => Subscription, {
    nullable: true,
  })
  @JoinColumn()
  subscription: Subscription;
  @ManyToOne(() => PortalUser)
  @JoinColumn()
  user: PortalUser;

  @ManyToOne(() => ServiceFee)
  @JoinColumn()
  serviceFee: ServiceFee;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastPayDate: Date;


}