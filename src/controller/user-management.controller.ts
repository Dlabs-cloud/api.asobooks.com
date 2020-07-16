import { Controller, Get, Param, Redirect } from '@nestjs/common';
import { UserManagementService } from '../service/user-management.service';
import { ApiResponseDto } from '../dto/api-response.dto';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { Public } from '../conf/security/annotations/public';


@Controller('user-management')
export class UserManagementController {

  constructor(private readonly userManagementService: UserManagementService) {
  }

  @Get('/validate-principal/:token')
  public async principalSetUp(@Param('token') token: string) {
    try {
      await this.userManagementService.validatePrincipalUser(token);
      return new ApiResponseDto();
    } catch (e) {
      if (e instanceof IllegalArgumentException) {
        throw new IllegalArgumentException('Token is  more valid');
      }
    }
  }
}