import {Controller, Get} from '@nestjs/common';
import {Public} from '../conf/security/annotations/public';

@Controller('/test')
export class TestController {

    @Get()
    @Public()
    index() {
        return 'socialite.io';
    }

}