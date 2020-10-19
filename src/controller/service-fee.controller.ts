import {Body, Controller, Get, NotFoundException, Param, Post, Query} from '@nestjs/common';
import {ServiceFeeRequestDto} from '../dto/service-fee-request.dto';
import {RequestPrincipalContext} from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import {RequestPrincipal} from '../dlabs-nest-starter/security/request-principal.service';
import {ServiceFeeService} from '../service/service-fee.service';
import {ApiResponseDto} from '../dto/api-response.dto';
import {Connection} from 'typeorm';
import {ServiceFeeRepository} from '../dao/service-fee.repository';
import {AssociationContext} from '../dlabs-nest-starter/security/annotations/association-context';
import {PortalAccountTypeConstant} from '../domain/enums/portal-account-type-constant';
import {GenericStatusConstant} from '../domain/enums/generic-status-constant';
import {MembershipRepository} from '../dao/membership.repository';
import {Membership} from '../domain/entity/membership.entity';
import {ServiceFeeFilterDto} from "../dto/service-fee-filter.dto";

@Controller('service-fees')
@AssociationContext()
export class ServiceFeeController {

    constructor(private readonly serviceFeeService: ServiceFeeService,
                private readonly connection: Connection) {
    }

    @Post()
    public async createService(@Body() serviceFeeRequestDto: ServiceFeeRequestDto,
                               @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {


        let recipients = serviceFeeRequestDto.recipients;
        let members: Membership[] = null;
        if (recipients) {
            members = await this.connection.getCustomRepository(MembershipRepository)
                .findByAssociationAndAccountTypeAndStatusAndUserIds(requestPrincipal.association,
                    PortalAccountTypeConstant.MEMBER_ACCOUNT, GenericStatusConstant.ACTIVE,
                    ...recipients);

        }
        let serviceFee = await this.serviceFeeService
            .createService(serviceFeeRequestDto, requestPrincipal.association, members);
        let response = {code: serviceFee.code};
        return new ApiResponseDto(response, 201);
    }

    @Get()
    public async getAllServiceFee(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                                  @Query() serviceFeeFilterDto: ServiceFeeFilterDto) {
        serviceFeeFilterDto.limit = serviceFeeFilterDto.limit > 100 ? 100 : serviceFeeFilterDto.limit ?? 100;
        serviceFeeFilterDto.offset = serviceFeeFilterDto.offset < 0 ? 0 : serviceFeeFilterDto.offset ?? 0;


        let allServiceFee = await this.connection
            .getCustomRepository(ServiceFeeRepository)
            .getAllServiceFeeByAssociationCodeAndStatus(requestPrincipal.association, GenericStatusConstant.ACTIVE, serviceFeeFilterDto);
        console.log(allServiceFee)
        return new ApiResponseDto(allServiceFee);
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