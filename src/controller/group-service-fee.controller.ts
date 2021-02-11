import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Query } from '@nestjs/common';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { MembershipFeeRequestDto } from '../dto/membership-fee-request.dto';
import { GroupService } from '../service-impl/group.service';
import { Connection } from 'typeorm';
import { GroupRepository } from '../dao/group.repository';
import { ServiceFeeRepository } from '../dao/service-fee.repository';
import { MembershipRepository } from '../dao/membership.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { PortalUserQueryDto } from '../dto/portal-user-query.dto';
import { MembershipInfoHandler } from './handlers/membership-info.handler';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { MembershipInfoRepository } from '../dao/membership-info.repository';

@Controller('service-fees')
@AssociationContext()
export class GroupServiceFeeController {

  constructor(private readonly connection: Connection,
              private readonly membershipInfoHandler: MembershipInfoHandler,
              private readonly groupService: GroupService) {
  }

  @Patch('/:code/members')
  public async addMember(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                         @Param('code') code: string,
                         @Body() request: MembershipFeeRequestDto) {


    let memberships = await this.connection
      .getCustomRepository(MembershipRepository)
      .findByAssociationAndAccountTypeAndStatusAndIdentifiers(
        requestPrincipal.association,
        PortalAccountTypeConstant.MEMBER_ACCOUNT,
        GenericStatusConstant.ACTIVE,
        ...request.memberIdentifiers,
      );

    let serviceFee = await this.connection.getCustomRepository(ServiceFeeRepository).findByCodeAndAssociation(code, requestPrincipal.association);
    if (!serviceFee) {
      throw new NotFoundException(`Service-fee with code ${code} cannot be found`);
    }
    let group = await this.connection.getCustomRepository(GroupRepository).findByServiceFee(serviceFee);

    if (!group) {
      throw new IllegalArgumentException('Group for service-impl fee cannot be found');
    }
    return this.connection.transaction(entityManager => {
      return this.groupService.addMember(entityManager, group[0], ...memberships);
    }).then(result => {
      return new ApiResponseDto();
    });


  }


  @Get('/:code/members')
  public async getMembers(@RequestPrincipalContext()requestPrincipal: RequestPrincipal,
                          @Param('code')code: string,
                          @Query() query: PortalUserQueryDto) {

    query.limit = query.limit > 100 ? 100 : query.limit;
    query.offset = query.offset < 0 ? 0 : query.offset;
    let membershipInfos = await this.connection
      .getCustomRepository(MembershipInfoRepository)
      .findByAssociationAndUserQuery(requestPrincipal.association, query);
    const transformData = await this.membershipInfoHandler.transform(membershipInfos[0]);
    let serviceFee = await this.connection
      .getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(code, requestPrincipal.association);

    let serviceFeeUsers = await this.connection.getCustomRepository(PortalUserRepository).findByServiceFeeAndStatus(serviceFee);

    let response = transformData.map(portalUser => {
      const isUserServiceFee = !!serviceFeeUsers[0].find(serviceFeeUser => serviceFeeUser.id === portalUser.id);
      return {
        portalUser,
        hasServiceFee: isUserServiceFee,
      };
    });

    let paginatedResponseDto = new PaginatedResponseDto();
    paginatedResponseDto.items = response;
    paginatedResponseDto.total = membershipInfos[1];
    paginatedResponseDto.itemsPerPage = query.limit;
    paginatedResponseDto.offset = query.offset;
    return new ApiResponseDto(paginatedResponseDto, 200);
  }

  @Delete('/:serviceCode/members')
  public async removeMember(@Param('serviceCode') serviceCode: string,
                            @Query('memberIdentifier') memberIdentifiers: string[],
                            @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {


    if (!memberIdentifiers.length) {
      throw new IllegalArgumentException('member identifiers must be provided');
    }

    let memberships = await this.connection
      .getCustomRepository(MembershipRepository)
      .findByAssociationAndAccountTypeAndStatusAndIdentifiers(
        requestPrincipal.association,
        PortalAccountTypeConstant.MEMBER_ACCOUNT,
        GenericStatusConstant.ACTIVE,
        ...memberIdentifiers,
      );

    if (!memberships) {
      throw new IllegalArgumentException('non of the member identifiers can be found');
    }
    let serviceFee = await this.connection.getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(serviceCode, requestPrincipal.association);
    if (!serviceFee) {
      throw new NotFoundException(`Service fee with code ${serviceFee} cannot be found`);
    }

    let group = await this.connection.getCustomRepository(GroupRepository).findByServiceFee(serviceFee);
    return this.connection.transaction(async entityManager => {
      return this.groupService.removeMember(entityManager, group[0], ...memberships);
    }).then(result => {
      return new ApiResponseDto(null, 204);
    });
  }
}