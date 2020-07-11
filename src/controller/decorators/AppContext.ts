import {createParamDecorator} from '@nestjs/common';

// tslint:disable-next-line:variable-name
export const AppContext = createParamDecorator((data, req) => {
    return req.app;
});
