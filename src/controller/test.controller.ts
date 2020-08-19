import { Controller, Get } from '@nestjs/common';
import { Public } from '../conf/security/annotations/public';
import { AssociationContext } from '../conf/security/annotations/association-context';
import { RequestPrincipalContext } from '../conf/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../conf/security/request-principal.service';

@Controller('test')
export class TestController {

  @Get()
  @Public()
  index() {
    return 'AsoBooks.com';
  }

  @Get('/association')
  @AssociationContext()
  public getAssociation(@RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return {
      'name': requestPrincipal.association.name,
      'type': requestPrincipal.association.type,
    };
  }

}