import { AssociationContext } from '../conf/security/annotations/association-context';
import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { RequestPrincipalContext } from '../conf/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../conf/security/request-principal.service';
import { MembershipFeeRequestDto } from '../dto/membership-fee.-request.dto';
import { GroupService } from '../service/group.service';
import { Connection } from 'typeorm';
import { GroupRepository } from '../dao/group.repository';
import { ServiceFeeRepository } from '../dao/service-fee.repository';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { MembershipRepository } from '../dao/membership.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PortalUserRepository } from '../dao/portal-user.repository';

@Controller('service-fees')
@AssociationContext()
export class MembershipFeeController {

  constructor(private readonly connection: Connection,
              private readonly groupService: GroupService) {
  }

  @Post('/:code/members')
  public async addMember(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                         @Param('code') code: string,
                         @Body() request: MembershipFeeRequestDto) {

    let memberships = await this.connection
      .getCustomRepository(MembershipRepository)
      .findByAssociationAndAccountTypeAndStatusAndUserIds(
        requestPrincipal.association,
        PortalAccountTypeConstant.MEMBER_ACCOUNT,
        GenericStatusConstant.ACTIVE,
        ...request.recipients,
      );

    let serviceFee = await this.connection.getCustomRepository(ServiceFeeRepository).findByCodeAndAssociation(code, requestPrincipal.association);
    let group = await this.connection.getCustomRepository(GroupRepository).findOneItemByStatus({
      name: `${serviceFee.name}-${serviceFee.type}`,
      type: GroupTypeConstant.SERVICE_FEE,
    });

    return this.connection.transaction(entityManager => {
      return this.groupService.addMember(entityManager, group, ...memberships);
    }).then(result => {
      return new ApiResponseDto();
    });


  }


  @Get('/:code/members')
  public async getMembers(@RequestPrincipalContext()requestPrincipal: RequestPrincipal,
                          @Param('code')code: string,
                          @Query('limit')limit = 20,
                          @Query('offset')offset = 0) {
    let serviceFee = await this.connection
      .getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(code, requestPrincipal.association);
    if (serviceFee) {
      new NotFoundException(`Service fee with code ${code} cannot be found`);
    }
    return this.connection
      .getCustomRepository(PortalUserRepository)
      .findByServiceFeeAndStatus(serviceFee, limit, offset)
      .then(portalUserNumbers => {
        return {
          items: portalUserNumbers[0],
          itemsPerPage: limit,
          offset: offset,
          total: portalUserNumbers[1],
        };
      });

  }

  @Delete('/:serviceCode/member')
  public async removeMember(@Param('serviceCode') serviceCode: string,
                            @Body() membershipFeeRequestDto: MembershipFeeRequestDto,
                            @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {


    let memberships = await this.connection
      .getCustomRepository(MembershipRepository)
      .findByAssociationAndAccountTypeAndStatusAndUserIds(
        requestPrincipal.association,
        PortalAccountTypeConstant.MEMBER_ACCOUNT,
        GenericStatusConstant.ACTIVE,
        ...membershipFeeRequestDto.recipients,
      );


    let serviceFee = await this.connection.getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(serviceCode, requestPrincipal.association);

    let group = await this.connection.getCustomRepository(GroupRepository).findOneItemByStatus({
      name: `${serviceFee.name}-${serviceFee.type}`,
      type: GroupTypeConstant.SERVICE_FEE,
    });

    await this.connection.transaction(async entityManager => {
      return this.groupService.removeMember(entityManager, group, ...memberships);
    });


  }
}