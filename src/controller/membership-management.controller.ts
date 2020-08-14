import { Body, Controller, Post } from '@nestjs/common';
import { UserManagementService } from '../service/user-management.service';
import { Connection } from 'typeorm';
import { ServiceFeeRequestDto } from '../dto/service-fee-request.dto';
import { RequestPrincipalContext } from '../conf/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../conf/security/request-principal.service';
import { MemberSignUpDto } from '../dto/user/member-sign-up.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { AssociationContext } from '../conf/security/annotations/association-context';


@Controller('membership-management')
@AssociationContext()
export class MembershipManagementController {

  constructor(private readonly userManagementService: UserManagementService) {
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


}