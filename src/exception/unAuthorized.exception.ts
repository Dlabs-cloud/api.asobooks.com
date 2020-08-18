export class UnAuthorizedException extends Error {
  constructor(message: string) {
    super(message);
  }
}
