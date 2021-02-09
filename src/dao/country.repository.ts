import { BaseRepository } from '../common/BaseRepository';
import { Country } from '../domain/entity/country.entity';
import { EntityRepository } from 'typeorm';
import { GenerateAction } from '@nestjs/cli/actions';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(Country)
export class CountryRepository extends BaseRepository<Country> {
  getAll() {
    return this.createQueryBuilder('country')
      .where('status = :status', { status: GenericStatusConstant.ACTIVE })
      .addOrderBy('name', 'ASC')
      .getMany();
  }
}