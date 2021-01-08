import {BaseEntity} from '../../common/base.entity';
import {Column, Entity, JoinColumn, OneToOne, ManyToOne} from 'typeorm';
import {Membership} from './membership.entity';
import {ActivityTypeConstant} from "../enums/activity-type-constant";
import {Association} from "./association.entity";

@Entity()
export class AssociationActivityEntity extends BaseEntity {
    @Column()
    description: string;

    @Column()
    activityType: ActivityTypeConstant;

    @OneToOne(() => Membership)
    @JoinColumn()
    membership: Membership;

    @ManyToOne(() => Association)
    @JoinColumn({name: 'associationId', referencedColumnName: 'id'})
    association: Association;

    @Column()
    associationId: number;

}