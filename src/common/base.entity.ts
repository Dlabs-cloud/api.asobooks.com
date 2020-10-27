import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { BaseEntity as Base, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';


export class BaseEntity extends Base {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'enum',
    enum: GenericStatusConstant,
    default: GenericStatusConstant.ACTIVE,

  })
  status?: GenericStatusConstant;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt?: Date;
}
