import {IsEmail, IsNotEmpty, IsString} from 'class-validator';

export class SignUpRequestDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;
    @IsString()
    @IsNotEmpty()
    lastName: string;
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
    @IsString()
    associationName: string;
    @IsString()
    @IsNotEmpty()
    password: string;
}