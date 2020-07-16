export class InValidTokenException extends Error {
  constructor(message: string) {
    super(message);
  }
}
