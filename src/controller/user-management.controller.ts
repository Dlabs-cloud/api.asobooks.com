import { Controller, Get, Param, Redirect } from '@nestjs/common';
import { UserManagementService } from '../service/user-management.service';
import { getConnection } from 'typeorm';
import { SettingRepository } from '../dao/setting.repository';
import { ApiResponseDto } from '../dto/api-response.dto';


@Controller('user-management')
export class UserManagementController {

  constructor(private readonly userManagementService: UserManagementService) {
  }

  @Get('/validate-principal/:token')
  public async principalSetUp(@Param('token') token: string) {
    await this.userManagementService.validatePrincipalUser(token);
    return new ApiResponseDto();
  }
}