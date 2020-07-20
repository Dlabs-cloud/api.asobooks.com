import { BaseRepository } from '../common/BaseRepository';
import { Country } from '../domain/entity/country.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(Country)
export class CountryRepository extends BaseRepository<Country> {

}