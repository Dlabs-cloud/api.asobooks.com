import { Body, Controller, Delete, NotFoundException, Param, Post } from '@nestjs/common';
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

@Controller('roles/:code/memberships')
@AssociationContext()
export class RoleMembershipController {

  constructor(private readonly roleService: RoleService,
              private readonly connection: Connection) {
  }

  @Post()
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


  @Delete('/:identifier')
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
}