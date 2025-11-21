import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AccountService } from '@core/services/account.service';
import { AccountReadDto, AccountType, AccountCreateDto, AccountUpdateDto } from '@core/models/account.model';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss']
})
export class AccountsListComponent implements OnInit, OnDestroy {
  accountForm: FormGroup;
  accounts: AccountReadDto[] = [];
  loading = false;
  isEditMode = false;
  editingAccountId: string | null = null;
  
  accountTypes = [
    { value: AccountType.Cash, label: 'Наличные', icon: '💵' },
    { value: AccountType.Card, label: 'Карта', icon: '💳' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      balance: [0, [Validators.required, Validators.min(0)]],
      type: [AccountType.Cash, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.accounts = result.items;
          this.loading = false;
        },
        error: (error) => {
          this.showError('Ошибка загрузки счетов');
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.editingAccountId) {
      this.updateAccount();
    } else {
      this.createAccount();
    }
  }

  createAccount(): void {
    const formValue = this.accountForm.value;
    const createDto: AccountCreateDto = {
      name: formValue.name,
      balance: formValue.balance,
      type: formValue.type
    };

    this.loading = true;
    this.accountService.create(createDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (id) => {
          this.showSuccess('Счёт успешно создан');
          this.accountForm.reset({ balance: 0, type: AccountType.Cash });
          this.loadAccounts();
        },
        error: (error) => {
          this.showError('Ошибка создания счёта');
          this.loading = false;
        }
      });
  }

  updateAccount(): void {
    if (!this.editingAccountId) return;

    const formValue = this.accountForm.value;
    const updateDto: AccountUpdateDto = {
      name: formValue.name,
      type: formValue.type
    };

    this.loading = true;
    this.accountService.update(this.editingAccountId, updateDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Счёт успешно обновлён');
          this.cancelEdit();
          this.loadAccounts();
        },
        error: (error) => {
          this.showError('Ошибка обновления счёта');
          this.loading = false;
        }
      });
  }

  editAccount(account: AccountReadDto): void {
    this.isEditMode = true;
    this.editingAccountId = account.id;
    this.accountForm.patchValue({
      name: account.name,
      balance: account.balance,
      type: account.type
    });
    // Disable balance field in edit mode (balance is read-only)
    this.accountForm.get('balance')?.disable();
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingAccountId = null;
    this.accountForm.reset({ balance: 0, type: AccountType.Cash });
    this.accountForm.get('balance')?.enable();
  }

  deleteAccount(account: AccountReadDto): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { accountName: account.name }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.performDelete(account.id);
        }
      });
  }

  performDelete(accountId: string): void {
    this.loading = true;
    this.accountService.delete(accountId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Счёт успешно удалён');
          this.loadAccounts();
        },
        error: (error) => {
          this.showError('Ошибка удаления счёта');
          this.loading = false;
        }
      });
  }

  getAccountTypeIcon(type: AccountType): string {
    return this.accountTypes.find(t => t.value === type)?.icon || '💰';
  }

  getAccountTypeLabel(type: AccountType): string {
    return this.accountTypes.find(t => t.value === type)?.label || 'Неизвестно';
  }

  formatBalance(balance: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(balance);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}

// Confirm Delete Dialog Component
@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Подтверждение удаления</h2>
    <mat-dialog-content>
      <p>Вы уверены, что хотите удалить счёт <strong>{{ data.accountName }}</strong>?</p>
      <p class="warning">Это действие нельзя отменить.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Отмена</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Удалить</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .warning {
      color: #f44336;
      font-size: 14px;
      margin-top: 8px;
    }
    mat-dialog-actions {
      padding: 16px 24px;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { accountName: string }) {}
}
