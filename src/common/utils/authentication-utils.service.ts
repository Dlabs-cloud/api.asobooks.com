import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';
import { sign, verify, VerifyCallback, VerifyErrors } from 'jsonwebtoken';

@Injectable()
export class AuthenticationUtils {

  public hashPassword(password: string): Promise<string> {
    return genSalt(Number(process.env.SALT_ROUNDS)).then((salt: string) => {
      return hash(password, salt);
    });
  }

  public comparePassword(password: string, hashedPassword: string) {
    return compare(password, hashedPassword);
  }

  public generateToken(userId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const token: string = sign({ sub: userId }, process.env.AUTH_SECRET, {
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

  public verifyBearerToken(token: string) {
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