import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AssociationTypeConstant } from '../enums/association-type-constant';
import { Address } from './address.entity';
import { File } from './file.entity';
import { Bank } from './bank.entity';

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
  @Column()
  code: string;
}