import { BaseRepository } from '../common/BaseRepository';
import { EntityRepository } from 'typeorm';
import { Association } from '../domain/entity/association.entity';
import { AssociationFileTypeConstant } from '../domain/enums/association-file-type.constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { AssociationFile } from '../domain/entity/association-file.entity';

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
      .createQueryBuilder('associationFile')
      .select()
      .innerJoin(Association, 'association', 'associationFile.association = association.id')
      .where('association.id=:association')
      .andWhere('associationFile.type = :type')
      .andWhere('associationFile.status=:status');
  }

  findOneByAssociationAndType(association: Association,
                              type: AssociationFileTypeConstant,
                              status: GenericStatusConstant = GenericStatusConstant.ACTIVE) {
    return this.getAssociationFileSelectQueryBuilder()
      .setParameter('association', association.id)
      .setParameter('type', type)
      .setParameter('status', status)
      .getOne();
  }


}