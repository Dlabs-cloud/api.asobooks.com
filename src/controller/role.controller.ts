import { Body, Controller } from '@nestjs/common';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { RoleRequest } from '../dto/role.request';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { RoleService } from '../service-impl/role.service';
import { ApiResponseDto } from '../dto/api-response.dto';

@AssociationContext()
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {
  }

  create(@Body()request: RoleRequest,
         @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this.roleService.createRole(request, requestPrincipal.association)
      .then(role => {
        return new ApiResponseDto(role, 201);
      });
  }
}