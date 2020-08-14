import { EntityManager, EntityRepository } from 'typeorm';
import { Address } from '../domain/entity/address.entity';
import { Country } from '../domain/entity/country.entity';
import { AddressDto } from '../dto/address.dto';
import { BaseRepository } from '../common/BaseRepository';

@EntityRepository(Address)
export class AddressRepository extends BaseRepository<Address> {

  async saveAddress(entityManager: EntityManager, addressDto: AddressDto) {
    const address = new Address();
    address.country = addressDto.country;
    address.name = addressDto.name;
    await entityManager.save(address);
    return address;
  }


}