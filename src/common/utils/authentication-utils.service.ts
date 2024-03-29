import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';
import { sign, SignOptions, verify, VerifyCallback, VerifyErrors } from 'jsonwebtoken';
import { TokenTypeConstant } from '../../domain/enums/token-type-constant';
import { JwtPayloadDto } from '../../dto/jwt-payload.dto';

@Injectable()
export class AuthenticationUtils {

  public hashPassword(password: string): Promise<string> {
    const value = process.env.SALT_ROUNDS;
    return genSalt(Number(4)).then((salt: string) => {
      return hash(password, salt);
    });
  }

  public comparePassword(password: string, hashedPassword: string) {
    return compare(password, hashedPassword);
  }


  public generateGenericToken(payload: object): Promise<string> {

    return new Promise((resolve, reject) => {
      const token: string = sign(payload, process.env.AUTH_SECRET, {
        issuer: process.env.PROJECT_NAME,
      });
      if (token) {
        return resolve(token);
      } else {
        reject('Token cannot be generated');
      }
    });
  }

  private verifyToken(bearerToken: string, cb: VerifyCallback) {

    verify(bearerToken,
      process.env.AUTH_SECRET,
      { ignoreExpiration: true },
      cb);
  }

  public verifyBearerToken(token: string): Promise<string | object> {
    return new Promise((resolve, reject) => {
      this.verifyToken(token, (err: VerifyErrors, decoded: object | string) => {
        if (err) {
          if (err instanceof SyntaxError) {
            reject('Token is invalid');
          } else {
            reject(err);
          }
        }
        if (decoded) {
          resolve(decoded);
        }
      });
    });
  }
}
