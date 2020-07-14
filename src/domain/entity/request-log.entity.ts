import {BaseEntity} from '../../common/base.entity';
import {Column, Entity, EntityManager} from 'typeorm';

@Entity()
export class RequestLogEntity extends BaseEntity {

    @Column()
    requestData: string;

    @Column()
    requestUrl: string;

    @Column()
    requestType: string;

    @Column()
    ip: string;

    @Column({
        nullable: true,
    })
    responseData: string;
}