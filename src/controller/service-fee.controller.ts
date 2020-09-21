import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ServiceFeeRequestDto } from '../dto/service-fee-request.dto';
import { RequestPrincipalContext } from '../conf/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../conf/security/request-principal.service';
import { ServiceFeeService } from '../service/service-fee.service';
import { ApiResponseDto } from '../dto/api-response.dto';
import { Connection } from 'typeorm';
import { ServiceFeeRepository } from '../dao/service-fee.repository';
import { AssociationContext } from '../conf/security/annotations/association-context';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalUser } from '../domain/entity/portal-user.entity';

@Controller('service-fees')
@AssociationContext()
export class ServiceFeeController {

  constructor(private readonly serviceFeeService: ServiceFeeService,
              private readonly connection: Connection,
              private readonly userRepository: PortalUserRepository) {
  }

  @Post()
  public async createService(@Body() serviceFeeRequestDto: ServiceFeeRequestDto,
                             @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {

    let recipients = serviceFeeRequestDto.recipients;
    let portalUsers: PortalUser[] = null;
    if (recipients) {
      portalUsers = await this.userRepository.findByAssociationAndTypeAndStatusAndCodes(requestPrincipal.association,
        PortalAccountTypeConstant.MEMBER_ACCOUNT,
        GenericStatusConstant.ACTIVE,
        ...recipients);
    }

    let serviceFee = await this.serviceFeeService.createService(serviceFeeRequestDto, requestPrincipal.association, portalUsers);
    let response = { code: serviceFee.code };
    return new ApiResponseDto(response, 201);

  }

  @Get('/:code')
  public async getServiceByCode(@Param('code')code: string, @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    let serviceFee = await this.connection
      .getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(code, requestPrincipal.association);
    if (!serviceFee) {
      throw  new NotFoundException(`service fee with code ${code} cannot be found`);
    }
    return new ApiResponseDto(serviceFee);
  }
}