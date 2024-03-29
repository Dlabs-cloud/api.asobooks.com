import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { RoleMembershipRequestDto } from '../dto/role-membership.request.dto';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { RoleRepository } from '../dao/role.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { MembershipRepository } from '../dao/membership.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { ApiResponseDto } from '../dto/api-response.dto';
import { RoleService } from '../service-impl/role.service';
import { Connection } from 'typeorm/connection/Connection';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { MembershipRoleRepository } from '../dao/membership-role.repository';
import { MembershipRoleQueryDto } from '../dto/membership-role.query.dto';
import { MembershipRolesHandler } from './handlers/membership.roles.handler';
import { UpdateRoleMembersDto } from '../dto/update-role-members.dto';

@Controller()
@AssociationContext()
export class RoleMembershipController {

  constructor(private readonly roleService: RoleService,
              private readonly membershipRoleHandler: MembershipRolesHandler,
              private readonly connection: Connection) {
  }

  @Get('/role-memberships')
  getMembershipRoles(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                     @Query() query: MembershipRoleQueryDto) {

    return this.connection
      .getCustomRepository(MembershipRoleRepository)
      .findByByAssociation(requestPrincipal.association, query)
      .then(roleMembership => {
        const res = this.membershipRoleHandler.transform(roleMembership);
        return new ApiResponseDto(res);
      });
  }

  @Post('/roles/:code/memberships')
  addMembership(@Body()request: RoleMembershipRequestDto,
                @Param('code')code: string,
                @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.connection.getCustomRepository(RoleRepository)
      .findOne({ code, status: GenericStatusConstant.ACTIVE, association: requestPrincipal.association })
      .then(role => {
        if (!role) {
          throw new NotFoundException('Role with code cannot be found');
        }
        return this.connection
          .getCustomRepository(MembershipRepository)
          .findByAssociationAndPortalAccountTypeReferences(requestPrincipal.association, PortalAccountTypeConstant.EXECUTIVE_ACCOUNT, GenericStatusConstant.ACTIVE, ...request.membershipReferences)
          .then(memberships => {
            if (!memberships || !memberships.length) {
              throw new IllegalArgumentException('At least valid membership must be provided');
            }
            return this.roleService.assignMemberships(role, memberships).then(() => new ApiResponseDto({}, 204));
          });
      });
  }


  @Delete('/roles/:code/memberships/:identifier')
  removeMember(@Param('code') code: string,
               @Param('identifier')identifier: string,
               @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {

    return this.connection.getCustomRepository(RoleRepository)
      .findOne({ code, status: GenericStatusConstant.ACTIVE, association: requestPrincipal.association })
      .then(role => {
        if (!role) {
          throw new NotFoundException('Role with code cannot be found');
        }
        return this.connection
          .getCustomRepository(MembershipRepository)
          .findByAssociationAndPortalAccountTypeReferences(requestPrincipal.association, PortalAccountTypeConstant.EXECUTIVE_ACCOUNT, GenericStatusConstant.ACTIVE, identifier)
          .then(membership => {
            if (!membership) {
              throw new NotFoundException(`Membership with identifier ${identifier} cannot found`);
            }
            return this.roleService.removeMember(role, membership[0]).then(() => {
              return new ApiResponseDto({}, 204);
            });
          });
      });
  }

  @Get('/roles/:code/memberships')
  getMember(@Param('code') code: string,
            @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.connection
      .getCustomRepository(RoleRepository)
      .findOneItemByStatus({ association: requestPrincipal.association, code })
      .then(role => {
        if (!role) {
          throw new NotFoundException('Role with code could not be found');
        }
        return this.connection
          .getCustomRepository(MembershipRepository)
          .findByRole(role).then(memberships => {
            return memberships.map(membership => {
              const membershipInfo = membership.membershipInfo;
              const portalUser = membershipInfo.portalUser;
              return {
                firstName: portalUser.firstName,
                lastName: portalUser.lastName,
                phoneNumber: portalUser.phoneNumber,
                email: portalUser.email,
                identifier: membershipInfo.identifier,
              };
            });
          });
      }).then(memberInfos => new ApiResponseDto(memberInfos));

  }

  @Patch('/roles/:code/memberships')
  updateRole(@Param('code') code: string,
             @Body() request: UpdateRoleMembersDto,
             @RequestPrincipalContext()  requestPrincipal: RequestPrincipal) {

    const membersReference = [...request.add, ...request.remove];
    return this.connection
      .getCustomRepository(RoleRepository)
      .findOneItemByStatus({ association: requestPrincipal.association, code })
      .then(role => {
        if (!role) {
          throw new NotFoundException('Role with code cannot be found');
        }
        return this.connection.getCustomRepository(MembershipRepository)
          .findByAssociationAndPortalAccountTypeReferences(
            requestPrincipal.association,
            PortalAccountTypeConstant.EXECUTIVE_ACCOUNT,
            GenericStatusConstant.ACTIVE,
            ...membersReference).then(memberships => {
            if (memberships && !memberships.length) {
              return Promise.resolve();
            }
            return this.connection.transaction(em => {
              const membersToAdd = memberships.filter(membership =>
                !!request.add.find(identifier => identifier === membership.membershipInfo.identifier),
              );
              const membersToRemove = memberships.filter(membership =>
                !!request.remove.find(identifier => identifier === membership.membershipInfo.identifier),
              );
              const members = membersToAdd.map(mem => {
                return this.roleService.createRoleMember(em, mem, role);
              });
              const removeMemberPromise = membersToRemove.map(mem => {
                return this.roleService.deActivateMember(em, role, mem);
              });
              return Promise.all([members, removeMemberPromise]).then(() => Promise.resolve());
            });
          }).then(() => new ApiResponseDto());
      });

  }
}
