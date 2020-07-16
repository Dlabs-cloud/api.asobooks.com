import { Body, Controller, Get, Param, Post, Redirect } from '@nestjs/common';
import { UserManagementService } from '../service/user-management.service';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PasswordResetDto } from '../dto/auth/request/password-reset.dto';
import { Connection } from 'typeorm';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { Some } from 'optional-typescript';
import { ChangePasswordDto } from '../dto/auth/request/change-password.dto';
import { Public } from '../conf/security/annotations/public';


@Controller('user-management')
export class UserManagementController {

  constructor(private readonly userManagementService: UserManagementService,
              private readonly connection: Connection) {
  }



}