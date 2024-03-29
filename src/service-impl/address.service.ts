import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { AddressUpdateDto } from '../dto/address.update.dto';
import { AddressRepository } from '../dao/address.repository';
import { CountryRepository } from '../dao/country.repository';
import { AddressDto } from '../dto/address.dto';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Address } from '../domain/entity/address.entity';

@Injectable()
export class AddressService {
  public async updateMemberAddress(entityManager: EntityManager, membershipInfo: MembershipInfo, addressUpdate: AddressUpdateDto) {
    const addressRepository = entityManager.getCustomRepository(AddressRepository);

    const address: any = await addressRepository
      .findByIdAndStatus(membershipInfo.addressId, GenericStatusConstant.ACTIVE);

    if (!address) {
      const country = await entityManager
        .getCustomRepository(CountryRepository)
        .findOne({ code: addressUpdate.countryCode });

      if (!country) {
        throw new NotFoundException('Provided country code cannot be found');
      }
      const addressDto: AddressDto = {
        country: country,
        name: addressUpdate.address,
        unit: addressUpdate.unit,
      };
      return addressRepository.saveAddress(entityManager, addressDto);
    }

    if (addressUpdate.address) {
      address.name = addressUpdate.address;
    }
    if (addressUpdate.unit) {
      address.unit = addressUpdate.unit;
    }
    if (addressUpdate.countryCode) {
      await entityManager
        .getCustomRepository(CountryRepository)
        .findOne({ code: addressUpdate.countryCode })
        .then(country => {
          if (!country) {
            throw new NotFoundException('Country code does not exit');
          }
          address.country = country;
        });
    }
    return await entityManager.save(address);
  }

}
