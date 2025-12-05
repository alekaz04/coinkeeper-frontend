// Operation Type Enum
export enum OperationType {
  Income = 0,
  Expense = 1
}

// Operation Read DTO - returned from API
export interface OperationReadDto {
  id: string;
  operationTime: string; // ISO 8601 format
  amount: number;
  description: string;
  operationType: OperationType;
  categoryId: string;
  accountId: string;
}

// Operation Create DTO - for creating new operation
export interface OperationCreateDto {
  operationTime: string; // ISO 8601 format
  amount: number;
  description: string;
  operationType: OperationType;
  categoryId: string;
  accountId: string;
}

// Operation Update DTO - for updating existing operation
export interface OperationUpdateDto {
  operationTime: string;
  amount: number;
  description: string;
  operationType: OperationType;
  categoryId: string;
  accountId: string;
}
