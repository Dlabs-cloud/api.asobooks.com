import { AssociationContext } from '../conf/security/annotations/association-context';
import { Body, Controller, Delete, NotFoundException, Param, Post } from '@nestjs/common';
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

@Controller('service-fee')
@AssociationContext()
export class MembershipFeeController {

  constructor(private readonly connection: Connection,
              private readonly groupService: GroupService) {
  }

  @Post('/:code/member')
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

    await Promise
      .all(memberships
        .map(membership => this.groupService.addMember(group, membership)));
    return new ApiResponseDto();
  }


  @Delete('/:serviceCode/member/:userCode')
  public async removeMember(@Param('serviceCode') serviceCode: string,
                            @Param('userCode') userId: number,
                            @RequestPrincipalContext() requestPrincipal: RequestPrincipal,
  ) {


    let memberships = await this.connection
      .getCustomRepository(MembershipRepository)
      .findByAssociationAndAccountTypeAndStatusAndUserIds(
        requestPrincipal.association,
        PortalAccountTypeConstant.MEMBER_ACCOUNT,
        GenericStatusConstant.ACTIVE,
        ...[userId],
      );

    let membership = memberships[0];

    if (!memberships && !membership) {
      throw new NotFoundException(`user with code ${userId}does not exist`);
    }


    let serviceFee = await this.connection.getCustomRepository(ServiceFeeRepository).findByCodeAndAssociation(serviceCode, requestPrincipal.association);

    let group = await this.connection.getCustomRepository(GroupRepository).findOneItemByStatus({
      name: `${serviceFee.name}-${serviceFee.type}`,
      type: GroupTypeConstant.SERVICE_FEE,
    });

    await this.connection.transaction(async entityManager => {
      return this.groupService.removeMember(group, membership, entityManager);
    });


  }
}