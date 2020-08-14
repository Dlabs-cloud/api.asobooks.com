import { BaseController } from './BaseController';
import { Controller, Get } from '@nestjs/common';
import { Connection } from 'typeorm';
import { BankRepository } from '../dao/bank.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ApiResponseDto } from '../dto/api-response.dto';
import { CountryRepository } from '../dao/country.repository';
import { Public } from '../conf/security/annotations/public';

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
    return new ApiResponseDto(banks);
  }

  @Get('counties')
  public async getCountries() {
    let countries = await this
      .connection
      .getCustomRepository(CountryRepository)
      .find({ status: GenericStatusConstant.ACTIVE });
    return new ApiResponseDto(countries);
  }
}