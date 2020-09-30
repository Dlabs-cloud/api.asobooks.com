import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserManagementService } from '../service/user-management.service';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { MemberSignUpDto } from '../dto/user/member-sign-up.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { Connection } from 'typeorm';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalUserDto } from '../dto/portal-user.dto';


@Controller('membership-management')
@AssociationContext()
export class MembershipManagementController {

  constructor(private readonly userManagementService: UserManagementService,
              private readonly connection: Connection) {
  }


  @Post('create')
  public async createAssociationMember(@Body() memberSignUpDto: MemberSignUpDto,
                                       @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    const membership = await this.userManagementService.createAssociationMember(memberSignUpDto, requestPrincipal.association);

    return new ApiResponseDto(membership, 201);
  }


  @Get()
  public async getAssociationMembers(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                                     @Query('type') type = PortalAccountTypeConstant.MEMBER_ACCOUNT,
                                     @Query('limit') limit?: number,
                                     @Query('offset') offset?: number) {
    let portalUsersAndCount = await this.connection
      .getCustomRepository(PortalUserRepository)
      .getByAssociationAndAccountType(requestPrincipal.association, type, GenericStatusConstant.ACTIVE, limit, offset);
    let users = (portalUsersAndCount[0] as PortalUser[]).map(portalUser => {
      return {
        email: portalUser.email,
        firstName: portalUser.firstName,
        lastName: portalUser.lastName,
        phoneNumber: portalUser.phoneNumber,
        username: portalUser.username,
        dateCreated: portalUser.createdAt,
      };
    });
    const response: PaginatedResponseDto<PortalUserDto> = {
      items: users,
      itemsPerPage: limit,
      offset: offset,
      total: portalUsersAndCount[1],
    };
    return new ApiResponseDto(response, 200);
  }


}