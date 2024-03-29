import { EntityManager, EntityRepository } from 'typeorm';
import { Address } from '../domain/entity/address.entity';
import { AddressDto } from '../dto/address.dto';
import { BaseRepository } from '../common/BaseRepository';

@EntityRepository(Address)
export class AddressRepository extends BaseRepository<Address> {

  async saveAddress(entityManager: EntityManager, addressDto: AddressDto) {
    const address = new Address();
    address.country = addressDto.country;
    address.name = addressDto.name;
    address.unit = addressDto.unit;
    await entityManager.save(address);
    return address;
  }


}