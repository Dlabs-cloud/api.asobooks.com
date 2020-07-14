import {Column, Entity} from 'typeorm';
import {BaseEntity} from '../../common/base.entity';

@Entity()
export class Setting extends BaseEntity {
    @Column()
    label: string;

    @Column()
    value: string;

}