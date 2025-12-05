import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OperationService } from '../../../core/services/operation.service';
import { AccountService } from '../../../core/services/account.service';
import { OperationReadDto, OperationType } from '../../../core/models/operation.model';
import { AccountReadDto } from '../../../core/models/account.model';

@Component({
  selector: 'app-operations-list',
  templateUrl: './operations-list.component.html',
  styleUrls: ['./operations-list.component.scss']
})
export class OperationsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data streams
  operations$ = this.operationService.operations$;
  loading$ = this.operationService.loading$;
  totalCount$ = this.operationService.totalCount$;
  accounts$ = this.accountService.accounts$;

  // Pagination
  pageSize = 10;
  pageNumber = 1;

  // Enums for template
  OperationType = OperationType;

  // Accounts map for quick lookup
  accountsMap = new Map<string, AccountReadDto>();

  constructor(
    private operationService: OperationService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load accounts first
    this.accountService.getAll().subscribe();

    // Subscribe to accounts to build map
    this.accounts$.pipe(takeUntil(this.destroy$)).subscribe(accounts => {
      this.accountsMap.clear();
      accounts.forEach(account => {
        this.accountsMap.set(account.id, account);
      });
    });

    // Load operations
    this.loadOperations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load operations with current pagination
   */
  loadOperations(): void {
    this.operationService.loadOperations({
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOperations();
  }

  /**
   * Navigate to create operation
   */
  onCreateOperation(): void {
    this.router.navigate(['/operations/create']);
  }

  /**
   * Navigate to edit operation
   */
  onEditOperation(operation: OperationReadDto): void {
    this.router.navigate(['/operations/edit', operation.id]);
  }

  /**
   * Delete operation with confirmation
   */
  onDeleteOperation(operation: OperationReadDto): void {
    if (confirm(`Вы уверены, что хотите удалить операцию "${operation.description}"?`)) {
      this.operationService.delete(operation.id).subscribe({
        next: () => {
          console.log('Operation deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete operation:', error);
        }
      });
    }
  }

  /**
   * Get account name by ID
   */
  getAccountName(accountId: string): string {
    const account = this.accountsMap.get(accountId);
    return account ? account.name : 'Неизвестный счет';
  }

  /**
   * Get operation type label
   */
  getOperationTypeLabel(type: OperationType): string {
    return type === OperationType.Income ? 'Доход' : 'Расход';
  }

  /**
   * Get operation type class for styling
   */
  getOperationTypeClass(type: OperationType): string {
    return type === OperationType.Income ? 'income' : 'expense';
  }
}
