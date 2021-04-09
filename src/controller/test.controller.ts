import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { Public } from '../dlabs-nest-starter/security/annotations/public';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';

@Controller('test')
export class TestController {

  @Get()
  @Public()
  index() {
    throw new InternalServerErrorException();
    // return 'AsoBooks.com';
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
