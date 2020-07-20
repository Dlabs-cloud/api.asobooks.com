import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Country } from './country.entity';

@Entity()
export class Address extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => Country)
  country: Country;

}