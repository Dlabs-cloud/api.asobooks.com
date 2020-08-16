import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserManagementService } from '../service/user-management.service';
import { RequestPrincipalContext } from '../conf/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../conf/security/request-principal.service';
import { MemberSignUpDto } from '../dto/user/member-sign-up.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { AssociationContext } from '../conf/security/annotations/association-context';
import { Connection } from 'typeorm';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { PortalUser } from '../domain/entity/portal-user.entity';


@Controller('membership-management')
@AssociationContext()
export class MembershipManagementController {

  constructor(private readonly userManagementService: UserManagementService,
              private readonly connection: Connection) {
  }


  @Post('create')
  public async createAssociationMember(@Body() memberSignUpDto: MemberSignUpDto,
                                       @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    const portalUser = await this.userManagementService.createAssociationMember(memberSignUpDto, requestPrincipal.association);
    let response = {
      username: portalUser.username,
      email: portalUser.email,
    };
    return new ApiResponseDto(response, 201);
  }


  @Get()
  public async getAssociationMembers(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                                     @Query('type') type =  PortalAccountTypeConstant.MEMBER_ACCOUNT,
                                     @Query('limit') limit?: number,
                                     @Query('offset') offset?: number) {
    let portalUsersAndCount = await this.connection
      .getCustomRepository(PortalUserRepository)
      .getByAssociationAndAccountType(requestPrincipal.association, type, GenericStatusConstant.ACTIVE, limit, offset);
    const response: PaginatedResponseDto<PortalUser> = {
      items: portalUsersAndCount[0],
      itemsPerPage: limit,
      offset: offset,
      total: portalUsersAndCount[1],
    };
    return new ApiResponseDto(response, 200);
  }


}