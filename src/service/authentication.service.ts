import {ConflictException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {Connection} from 'typeorm';
import {PortalUser} from '../domain/entity/portal-user.entity';
import {PortalAccount} from '../domain/entity/portal-account.entity';
import {PortalAccountRepository} from '../dao/portal-account.repository';
import {SignUpRequestDto} from '../dto/sign-up-request.dto';
import {GenericStatusConstant} from '../domain/enums/generic-status-constant';
import {PortalAccountService} from './portal-account.service';
import {Some} from 'optional-typescript';
import {PortalAccountTypeConstant} from '../domain/enums/portal-account-type-constant';
import {PortalUserRepository} from '../dao/portal-user.repository';
import {PortalUserService} from './portal-user.service';
import {Membership} from '../domain/entity/membership.entity';
import {LoginDto} from '../dto/auth/login.dto';
import {AuthenticationUtils} from '../common/utils/authentication-utils.service';

@Injectable()
export class AuthenticationService {

    constructor(private readonly authenticationUtils: AuthenticationUtils,
                private readonly connection: Connection,
                private readonly portalUserService: PortalUserService,
                private readonly portalAccountService: PortalAccountService) {

    }

    public signUpUser(signUpRequestDto: SignUpRequestDto): Promise<PortalUser> {

        return this.connection.transaction(async (entityManager) => {

            let portalAccount: PortalAccount = null;
            const accountName = signUpRequestDto.businessName ?? `${signUpRequestDto.firstName}-${signUpRequestDto.lastName}-${signUpRequestDto.email}`;
            const existingPortalAccount = await entityManager
                .getCustomRepository(PortalAccountRepository)
                .findOneItem({
                    name: accountName,
                });

            if (existingPortalAccount) {
                throw new ConflictException(`Account Name with ${accountName} already exist`);
            }

            portalAccount = new PortalAccount();
            portalAccount.type = PortalAccountTypeConstant.INDIVIDUAL;
            if (Some<string>(signUpRequestDto.businessName).hasValue) {
                portalAccount.type = PortalAccountTypeConstant.BUSINESS;
            }
            portalAccount.name = accountName;
            portalAccount = await this.portalAccountService.createPortalAccount(entityManager, portalAccount);

            const portalUser = new PortalUser();
            portalUser.firstName = signUpRequestDto.firstName;
            portalUser.lastName = signUpRequestDto.lastName;
            portalUser.username = signUpRequestDto.email.toLowerCase();
            portalUser.password = signUpRequestDto.password;
            portalUser.email = signUpRequestDto.email.toLowerCase();
            portalUser.phoneNumber = signUpRequestDto.phoneNumber;
            portalUser.status = GenericStatusConstant.IN_ACTIVE;
            await this.portalUserService.createPortalUser(entityManager, portalUser);

            const membership = new Membership();
            membership.portalUser = portalUser;
            membership.portalAccount = portalAccount;
            await entityManager.save(membership);
            delete portalUser.password;
            return portalUser;

        });
    }

    public async loginUser(loginDto: LoginDto): Promise<string> {

        return this.connection.getCustomRepository(PortalUserRepository)
            .findByUserNameOrEmailOrPhoneNumber(loginDto.username)
            .then(async portalUserValue => {
                if (portalUserValue) {
                    const isTrue = await this.authenticationUtils
                        .comparePassword(loginDto.password, portalUserValue.password);
                    if (isTrue) {
                        const token = await this.authenticationUtils.generateToken(portalUserValue.id);
                        return Promise.resolve(token);
                    }
                }
                throw new UnauthorizedException('Username or password is incorrect');
            });

    }

}
