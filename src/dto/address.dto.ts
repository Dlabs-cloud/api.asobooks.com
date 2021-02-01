import { Country } from '../domain/entity/country.entity';

export class AddressDto {
  name: string;
  country: Country;
  unit: string;
}