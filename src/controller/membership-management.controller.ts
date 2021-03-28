import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { UserManagementService } from '../service-impl/user-management.service';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { MemberSignUpDto } from '../dto/user/member-sign-up.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { Connection } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { PortalUserDto } from '../dto/portal-user.dto';
import { PortalUserQueryDto } from '../dto/portal-user-query.dto';
import { MembershipInfoRepository } from '../dao/membership-info.repository';
import { EditMemberDto } from '../dto/edit-member.dto';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { MembershipInfoHandler } from './handlers/membership-info.handler';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { AddressRepository } from '../dao/address.repository';


@Controller('membership-management')
@AssociationContext()
export class MembershipManagementController {

  constructor(private readonly userManagementService: UserManagementService,
              private readonly membershipsHandler: MembershipInfoHandler,
              private readonly connection: Connection) {
  }


  @Post('create')
  public async createAssociationMember(@Body() memberSignUpDto: MemberSignUpDto,
                                       @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    const association = await this.userManagementService.createAssociationMember(memberSignUpDto, requestPrincipal.association, requestPrincipal.portalUser);
    return new ApiResponseDto(association, 201);
  }

  @Get(':identifier')
  public getMember(@Param('identifier') identifier: string,
                   @RequestPrincipalContext() requestParameter: RequestPrincipal) {
    return this.connection.getCustomRepository(MembershipInfoRepository)
      .findOne({ association: requestParameter.association, identifier: identifier }, {
        relations: [
          'address',
        ],
      })
      .then(membershipInfo => {
        if (!membershipInfo) {
          throw new NotFoundException(`Member with identifier cannot be found`);
        }
        return this.connection
          .getCustomRepository(PortalAccountRepository)
          .findByPortalUserAndStatus(membershipInfo.portalUser)
          .then(portalAccounts => {
            const userInfo = membershipInfo.portalUser;
            const response: PortalUserDto = {
              accounts: portalAccounts.map(portalAccount => portalAccount.type),
              address: membershipInfo.address,
              dateCreated: membershipInfo.createdAt,
              email: userInfo.email,
              firstName: userInfo.firstName,
              gender: userInfo.gender,
              identifier: membershipInfo.identifier,
              lastName: userInfo.lastName,
              phoneNumber: userInfo.phoneNumber,
              username: userInfo.username,
            };
            return Promise.resolve(new ApiResponseDto(response));

          });
      });
  }

  @Get()
  public async getAssociationMembers(@RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                                     @Query() query: PortalUserQueryDto) {
    query.limit = !isEmpty(query.limit) && (query.limit < 100) ? query.limit : 100;
    query.offset = !isEmpty(query.offset) && (query.offset < 0) ? query.offset : 0;
    return this.connection
      .getCustomRepository(MembershipInfoRepository)
      .findByAssociationAndUserQuery(requestPrincipal.association, query)
      .then(membershipInfoCount => {
        const membershipInfos = membershipInfoCount[0] as MembershipInfo[];
        return this.membershipsHandler.transform(membershipInfos).then(users => {
          const response: PaginatedResponseDto<PortalUserDto> = {
            items: users || [],
            itemsPerPage: query.limit,
            offset: query.offset,
            total: membershipInfoCount[1],
          };
          return Promise.resolve(new ApiResponseDto(response, 200));
        });
      });
  }


  @Delete(':identifier')
  public deleteMember(@Param('identifier') identifier: string, @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.connection.getCustomRepository(MembershipInfoRepository)
      .findOne({ identifier: identifier, status: GenericStatusConstant.ACTIVE })
      .then(membershipInfo => {
        if (!membershipInfo) {
          throw new NotFoundException('Membership with identifier cannot be found');
        }
        return this.userManagementService.deActivateUser(membershipInfo, requestPrincipal.association)
          .then(() => {
            return Promise.resolve(new ApiResponseDto({}, 200));
          });
      });
  }


  @Patch(':identifier')
  public updateMember(@Param('identifier') identifier: string,
                      @RequestPrincipalContext()requestPrincipal: RequestPrincipal,
                      @Body()editMemberInfo: EditMemberDto) {
    return this
      .connection
      .getCustomRepository(MembershipInfoRepository)
      .findByIdentifierAndAssociationAndStatus(identifier, requestPrincipal.association)
      .then(membershipInfo => {
        if (!membershipInfo) {
          throw new NotFoundException(`Membership with identifier ${identifier} does not exit`);
        }
        return this.userManagementService
          .updateMembership(requestPrincipal.association, membershipInfo, editMemberInfo)
          .then(() => {
            return new ApiResponseDto();
          });
      });
  }


}
