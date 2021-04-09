import { Injectable, Logger, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
;

@Injectable({ scope: Scope.TRANSIENT })
export class Log extends Logger {

}
