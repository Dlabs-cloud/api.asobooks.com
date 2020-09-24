import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Subscription } from './subcription.entity';
import { Address } from './address.entity';
import { PortalUser } from './portal-user.entity';
import { ServiceFee } from './service.fee.entity';
import { Membership } from './membership.entity';

@Entity()
export class Bill extends BaseEntity {

  @Column()
  code: string;
  @ManyToOne(() => Membership)
  membership: Membership;
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
}