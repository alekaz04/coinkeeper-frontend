// Account Type Enum
export enum AccountType {
  Cash = 0,
  Card = 1
}

// Account Read DTO - returned from API
export interface AccountReadDto {
  id: string;
  name: string;
  balance: number;
  type: AccountType;
}

// Account Create DTO - for creating new account
export interface AccountCreateDto {
  name: string;
  balance: number;
  type: AccountType;
}

// Account Update DTO - for updating existing account
export interface AccountUpdateDto {
  name: string;
  type: AccountType;
}

// Pagination Request
export interface PaginationRequest {
  pageNumber?: number;
  pageSize?: number;
}

// Paged Result
export interface PagedResult<T> {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  items: T[];
}
