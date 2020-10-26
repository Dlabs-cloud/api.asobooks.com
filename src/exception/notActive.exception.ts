export class NotActiveException extends Error {
  constructor(message: string) {
    super(message);
  }
}
