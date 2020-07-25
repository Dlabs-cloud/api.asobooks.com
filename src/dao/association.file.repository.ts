import { BaseRepository } from '../common/BaseRepository';
import { AssociationFile } from '../domain/entity/association.file';
import { EntityRepository } from 'typeorm';
import { Association } from '../domain/entity/association.entity';
import { AssociationFileTypeConstant } from '../domain/enums/association-file-type.constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(AssociationFile)
export class AssociationFileRepository extends BaseRepository<AssociationFile> {

  findAllByAssociationAndCode(association: Association,
                              type: AssociationFileTypeConstant,
                              status: GenericStatusConstant = GenericStatusConstant.ACTIVE) {
    return this.getAssociationFileSelectQueryBuilder()
      .getMany();

  }

  private getAssociationFileSelectQueryBuilder() {
    return this
      .createQueryBuilder()
      .where('association =:association')
      .andWhere('type = :type').andWhere('status=:status');
  }

  findOneByAssociationAndCode(association: Association,
                                type: AssociationFileTypeConstant,
                                status: GenericStatusConstant = GenericStatusConstant.ACTIVE) {
    return this.getAssociationFileSelectQueryBuilder()
      .getOne();
  }


}