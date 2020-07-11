import {Column, Entity, JoinColumn, ObjectID, ObjectIdColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {BaseEntity} from './base.entity';
import {GenderConstant} from '../enums/gender-constant';

@Entity()
export class PortalUser extends BaseEntity {
    @Column()
    firstName: string;
    @Column()
    lastName: string;
    @Column({
        unique: true,
    })
    username: string;
    @Column({
        type: 'enum',
        enum: GenderConstant,
        nullable: true,
    })
    gender: GenderConstant;
    @Column()
    password: string;
    @Column()
    email: string;
    @Column()
    phoneNumber: string;
}
