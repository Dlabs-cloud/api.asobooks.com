export class AxiosResponseException extends Error {
  data: any;
  status: number;

  constructor(status: number, data) {
    super();
    this.data = data;
    this.status = status;
  }
}