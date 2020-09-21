import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ServiceFee } from './service.fee.entity';
import { PortalUser } from './portal-user.entity';


@Entity()
export class Subscription extends BaseEntity {
  @Column()
  code: string;

  @ManyToOne(() => ServiceFee)
  serviceFee: ServiceFee;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  previousBillingDate: Date;

  @Column({
    type: 'timestamp',
  })
  nextBillingDate: Date;

  @ManyToOne(() => PortalUser)
  portalUser: PortalUser;
}