import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { UserManagementService } from '../service-impl/user-management.service';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { MemberSignUpDto } from '../dto/user/member-sign-up.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { Connection } from 'typeorm';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalUserDto } from '../dto/portal-user.dto';
import { PortalUserQueryDto } from '../dto/portal-user-query.dto';
import { MembershipInfoRepository } from '../dao/membership-info.repository';


@Controller('membership-management')
@AssociationContext()
export class MembershipManagementController {

  constructor(private readonly userManagementService: UserManagementService,
              private readonly connection: Connection) {
  }


  @Post('create')
  public async createAssociationMember(@Body() memberSignUpDto: MemberSignUpDto,
                                       @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    const association = await this.userManagementService.createAssociationMember(memberSignUpDto, requestPrincipal.association, requestPrincipal.portalUser);
    return new ApiResponseDto(association, 201);
  }


  @Get()
  public async getAssociationMembers(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                                     @Query() query: PortalUserQueryDto) {
    return this.connection
      .getCustomRepository(PortalUserRepository)
      .getByAssociationAndQuery(requestPrincipal.association, query, GenericStatusConstant.ACTIVE)
      .then(portalUsersAndCount => {
        const portalUsers = portalUsersAndCount[0] as PortalUser[];
        if (!portalUsers.length) {
          return Promise.resolve(null);
        }

        return this.connection.getCustomRepository(MembershipInfoRepository)
          .findByAssociationAndPortalUsers(requestPrincipal.association, portalUsers)
          .then(membershipInfos => {
            const users = membershipInfos.map(membershipInfo => {
              const portalUser = portalUsers.find(portalUser => portalUser.id === membershipInfo.portalUserId);
              return {
                email: portalUser.email,
                firstName: portalUser.firstName,
                lastName: portalUser.lastName,
                phoneNumber: portalUser.phoneNumber,
                username: portalUser.username,
                dateCreated: portalUser.createdAt,
                id: portalUser.id,
                identifier: membershipInfo.identifier,
              };
            });
            return Promise.resolve({ users, total: portalUsersAndCount[1] });
          }).then(usersCount => {
            const response: PaginatedResponseDto<PortalUserDto> = {
              items: usersCount?.users || [],
              itemsPerPage: query.limit,
              offset: query.offset,
              total: usersCount?.total || 0,
            };
            return Promise.resolve(new ApiResponseDto(response, 200));
          });
      });
  }


  @Delete(':userId')
  public deleteMember(@Param('userId') userId: number, @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.connection.getCustomRepository(PortalUserRepository)
      .findByAssociationAndId(requestPrincipal.association, userId).then(portalUser => {
        if (!portalUser) {
          throw new NotFoundException(`User with id ${userId} cannot be found`);
        }
        return this.userManagementService.deActivateUser(portalUser, requestPrincipal.association)
          .then(() => {
            return Promise.resolve(new ApiResponseDto({}, 200));
          });
      });
  }


  @Patch(':identifier')
  public updateMember(@Param('identifier') identifier: string, @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    this
      .connection
      .getCustomRepository(MembershipInfoRepository)
      .findByIdentifierAndAssociationAndStatus(identifier, requestPrincipal.association)
      .then(membershipInfo => {
        if (!membershipInfo) {
          throw new NotFoundException(`Membership with identifier ${identifier} does not exit`);
        }

      });
  }


}