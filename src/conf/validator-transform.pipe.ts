import {
  ArgumentMetadata,
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class ValidatorTransformPipe implements PipeTransform<any> {

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const classObject = plainToClass(metadata.metatype, value);
    if (typeof classObject === 'string') {
      return value;
    }
    const validationErrors = await validate(classObject);
    if (validationErrors.length > 0) {
      throw new BadRequestException(this.createValidationMessage(validationErrors[0]));
    }

    return value;

  }

  private createValidationMessage(validationError: ValidationError) {
    const property = validationError.property, constraints: { [p: string]: string } = validationError.constraints;
    return {
      'property-name': property,
      'errors': Object.values(constraints),
    };
  }
}

