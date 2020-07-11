import {Body, Controller, Get, Post} from '@nestjs/common';
import {SignUpRequestDto} from '../dto/sign-up-request.dto';
import {AuthenticationService} from '../service/authentication.service';
import {Public} from '../conf/security/annotations/public';
import {LoginDto} from '../dto/auth/login.dto';
import {LoginResponseDto} from '../dto/auth/login-response.dto';
import {ApiResponseDto} from '../dto/api-response.dto';

@Controller()
export class AuthenticationController {

    constructor(private readonly authenticationService: AuthenticationService) {
    }

    @Public()
    @Post('sign-up')
    async signUp(@Body() signUpRequestDto: SignUpRequestDto) {
        const portalUser = await this.authenticationService.signUpUser(signUpRequestDto);
        return new ApiResponseDto(portalUser, 201);
    }

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const token = await this.authenticationService.loginUser(loginDto);
        const loginResponseDto = new LoginResponseDto();
        loginResponseDto.token = token;
        return new ApiResponseDto(loginResponseDto, 200);
    }
}