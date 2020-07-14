import {Column, Entity, Generated, JoinColumn, ManyToOne, ObjectID, ObjectIdColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {BaseEntity} from '../../common/base.entity';
import {PortalAccountTypeConstant} from '../enums/portal-account-type-constant';

@Entity()
export class PortalAccount extends BaseEntity {
    @Column({
        unique: true,
    })
    name: string;

    @Column({
        unique: true,
    })
    accountCode: string;

    @Column({
        type: 'enum',
        enum: PortalAccountTypeConstant,
    })
    type: PortalAccountTypeConstant;
}
