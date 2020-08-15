export class PaginatedResponseDto<T> {
  items: T[];
  total: number;
  itemsPerPage: number;
  offset: number;
}