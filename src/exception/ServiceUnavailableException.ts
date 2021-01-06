export class ServiceUnavailableException extends Error {
  constructor(message: string) {
    super(message);
  }
}