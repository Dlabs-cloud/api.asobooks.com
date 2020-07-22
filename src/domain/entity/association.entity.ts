import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AssociationTypeConstant } from '../enums/association-type-constant';
import { PortalAccountTypeConstant } from '../enums/portal-account-type-constant';
import { Address } from './address.entity';
import { PortalAccount } from './portal-account.entity';
import { File } from './file.entity';

@Entity()
export class Association extends BaseEntity {
  @Column()
  name: string;
  @Column({
    type: 'enum',
    enum: AssociationTypeConstant,
  })
  type: AssociationTypeConstant;

  @OneToOne(() => Address)
  @JoinColumn({ name: 'addressId' })
  address?: Address;
  @OneToOne(() => File)
  @JoinColumn({ name: 'logo' })
  logo?: File;
}