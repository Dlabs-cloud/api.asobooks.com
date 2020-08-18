import { Catch, UnauthorizedException } from '@nestjs/common';
import { InvalidtokenException } from '../../exception/invalidtoken.exception';

@Catch(UnauthorizedException)
export class UnAuthorizedExceptionFilter extends InvalidtokenException {

}