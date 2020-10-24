import { FileResource } from './file.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Association } from './association.entity';
import { BaseEntity } from '../../common/base.entity';
import { AssociationFileTypeConstant } from '../enums/association-file-type.constant';
import { GenericStatusConstant } from '../enums/generic-status-constant';

@Entity()
export class AssociationFile extends BaseEntity {
  @ManyToOne(() => FileResource)
  file: FileResource;
  @ManyToOne(() => Association)
  association: Association;

  @Column({
    type: 'enum',
    enum: AssociationFileTypeConstant,
  })
  type: AssociationFileTypeConstant;

}