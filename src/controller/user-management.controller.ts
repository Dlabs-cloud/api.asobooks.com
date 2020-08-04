import { Controller, Post } from '@nestjs/common';
import { UserManagementService } from '../service/user-management.service';
import { Connection } from 'typeorm';


@Controller('user-management')
export class UserManagementController {

  constructor(private readonly userManagementService: UserManagementService,
              private readonly connection: Connection) {
  }


  @Post('/')
  public createUser() {
    
  }


}