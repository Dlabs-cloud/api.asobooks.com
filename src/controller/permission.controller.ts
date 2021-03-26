import { Controller, Get } from '@nestjs/common';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { Connection } from 'typeorm/connection/Connection';
import { PermissionRepository } from '../dao/permission.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('permissions')
export class PermissionController {

  constructor(private readonly connection: Connection) {
  }

  @Get()
  get() {
    return this.connection
      .getCustomRepository(PermissionRepository)
      .find({
        status: GenericStatusConstant.ACTIVE,
      }).then(permissions => {
        const perms = permissions.map(permission => {
          return {
            name: permission.name,
            code: permission.code,
          };
        });
        return new ApiResponseDto(perms);
      });
  }
}
