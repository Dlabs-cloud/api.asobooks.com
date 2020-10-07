import { BaseController } from './BaseController';
import { Controller, Get } from '@nestjs/common';
import { Connection } from 'typeorm';
import { BankRepository } from '../dao/bank.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ApiResponseDto } from '../dto/api-response.dto';
import { CountryRepository } from '../dao/country.repository';
import { Public } from '../dlabs-nest-starter/security/annotations/public';
import { NameCodeDto } from '../dto/master-records/name-code.dto';

@Public()
@Controller('master-records')
export class MasterRecordController extends BaseController {

  constructor(private readonly connection: Connection) {
    super();
  }

  @Get('banks')
  public async getBanks() {
    let banks = await this
      .connection
      .getCustomRepository(BankRepository)
      .find({ status: GenericStatusConstant.ACTIVE });
    banks = banks.map(bank => {
      return {
        code: bank.code,
        name: bank.name,

      };
    });
    return new ApiResponseDto(banks);
  }

  @Get('/counties')
  public async getCountries() {
    let countries = await this
      .connection
      .getCustomRepository(CountryRepository)
      .find({ status: GenericStatusConstant.ACTIVE });

    countries = countries.map(country => {
      return {
        code: country.code,
        name: country.name,
      };
    });
    return new ApiResponseDto(countries);
  }
}