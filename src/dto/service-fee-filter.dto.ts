import {ServiceTypeConstant} from '../domain/enums/service-type.constant';
import {IsEnum, IsOptional} from 'class-validator';

export class ServiceFeeFilterDto {

    @IsEnum(ServiceTypeConstant)
    @IsOptional()
    type?: ServiceTypeConstant;
    @IsOptional()
    offset?: number = 0;
    @IsOptional()
    limit?: number = 100;
}