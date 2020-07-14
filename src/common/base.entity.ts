import {GenericStatusConstant} from '../domain/enums/generic-status-constant';
import {Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

export class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: GenericStatusConstant,
        default: GenericStatusConstant.ACTIVE

    })
    status: GenericStatusConstant;

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updatedAt: Date;
}
