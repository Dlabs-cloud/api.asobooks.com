export interface EmailQueueDto<T> {
  data: T;
  subject: string;
  templateName: string;
  from?: string;
  reply?: string;
  to?: string[] | string;
}