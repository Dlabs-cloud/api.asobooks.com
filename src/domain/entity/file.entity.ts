import { BaseEntity } from '../../common/base.entity';
import { Column, Entity } from 'typeorm';
import { FileTypeConstant } from '../enums/file-type-constant';

@Entity()
export class FileResource extends BaseEntity {
  @Column()
  servingUrl: string;
  @Column()
  name: string;
  @Column()
  contentType: string;
  @Column({
    type: 'enum',
    enum: FileTypeConstant,
    nullable: true,
  })
  type: FileTypeConstant;

  @Column()
  hostIdentifier: string;
}