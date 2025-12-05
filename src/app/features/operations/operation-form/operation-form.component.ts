import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OperationService } from '../../../core/services/operation.service';
import { AccountService } from '../../../core/services/account.service';
import { OperationType, OperationCreateDto, OperationUpdateDto } from '../../../core/models/operation.model';
import { AccountReadDto } from '../../../core/models/account.model';

@Component({
  selector: 'app-operation-form',
  templateUrl: './operation-form.component.html',
  styleUrls: ['./operation-form.component.scss']
})
export class OperationFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  operationForm!: FormGroup;
  isEditMode = false;
  operationId: string | null = null;
  loading = false;

  // Data
  accounts: AccountReadDto[] = [];
  
  // Enums for template
  OperationType = OperationType;
  operationTypes = [
    { value: OperationType.Income, label: 'Доход' },
    { value: OperationType.Expense, label: 'Расход' }
  ];

  // Mock categories (will be replaced with real data later)
  categories = [
    { id: '1', name: 'Продукты' },
    { id: '2', name: 'Транспорт' },
    { id: '3', name: 'Развлечения' },
    { id: '4', name: 'Зарплата' },
    { id: '5', name: 'Другое' }
  ];

  constructor(
    private fb: FormBuilder,
    private operationService: OperationService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAccounts();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize form
   */
  private initForm(): void {
    this.operationForm = this.fb.group({
      operationTime: [new Date(), Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      operationType: [OperationType.Expense, Validators.required],
      categoryId: ['', Validators.required],
      accountId: ['', Validators.required]
    });
  }

  /**
   * Load accounts
   */
  private loadAccounts(): void {
    this.accountService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.accounts = result.items;
        
        // Set first account as default if available
        if (this.accounts.length > 0 && !this.isEditMode) {
          this.operationForm.patchValue({
            accountId: this.accounts[0].id
          });
        }
      },
      error: (error) => {
        console.error('Failed to load accounts:', error);
      }
    });
  }

  /**
   * Check if in edit mode and load operation
   */
  private checkEditMode(): void {
    this.operationId = this.route.snapshot.paramMap.get('id');
    
    if (this.operationId) {
      this.isEditMode = true;
      this.loadOperation(this.operationId);
    }
  }

  /**
   * Load operation for editing
   */
  private loadOperation(id: string): void {
    this.loading = true;
    
    this.operationService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (operation) => {
        this.operationForm.patchValue({
          operationTime: new Date(operation.operationTime),
          amount: operation.amount,
          description: operation.description,
          operationType: operation.operationType,
          categoryId: operation.categoryId,
          accountId: operation.accountId
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load operation:', error);
        this.loading = false;
        this.router.navigate(['/operations']);
      }
    });
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.operationForm.invalid) {
      this.operationForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.operationForm.value;
    
    // Convert date to ISO string
    const operationData = {
      ...formValue,
      operationTime: formValue.operationTime.toISOString()
    };

    if (this.isEditMode && this.operationId) {
      this.updateOperation(this.operationId, operationData);
    } else {
      this.createOperation(operationData);
    }
  }

  /**
   * Create new operation
   */
  private createOperation(data: OperationCreateDto): void {
    this.operationService.create(data).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/operations']);
      },
      error: (error) => {
        console.error('Failed to create operation:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Update existing operation
   */
  private updateOperation(id: string, data: OperationUpdateDto): void {
    this.operationService.update(id, data).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/operations']);
      },
      error: (error) => {
        console.error('Failed to update operation:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/operations']);
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.operationForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'Это поле обязательно';
    }
    
    if (control?.hasError('min')) {
      return 'Значение должно быть больше 0';
    }
    
    if (control?.hasError('maxlength')) {
      return 'Превышена максимальная длина';
    }
    
    return '';
  }
}
