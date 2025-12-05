import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { OperationService } from '@core/services/operation.service';
import { AccountService } from '@core/services/account.service';
import { OperationReadDto, OperationType } from '@core/models/operation.model';
import { AccountReadDto } from '@core/models/account.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Card -->
      <mat-card class="welcome-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>dashboard</mat-icon>
            Добро пожаловать в CoinKeeper!
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Вы успешно вошли в систему.</p>
          <p *ngIf="currentUser">Email: {{ currentUser.login }}</p>

          <div class="quick-actions">
            <h3>Быстрые действия</h3>
            <div class="actions-grid">
              <button mat-raised-button color="primary" (click)="navigateToAccounts()">
                <mat-icon>account_balance_wallet</mat-icon>
                Управление счетами
              </button>
              <button mat-raised-button color="primary" (click)="navigateToOperations()">
                <mat-icon>receipt_long</mat-icon>
                Операции
              </button>
              <button mat-raised-button disabled>
                <mat-icon>category</mat-icon>
                Категории
              </button>
              <button mat-raised-button disabled>
                <mat-icon>event_repeat</mat-icon>
                Плановые операции
              </button>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="warn" (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            Выйти
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Recent Operations Card -->
      <mat-card class="operations-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>receipt_long</mat-icon>
            Последние операции
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- Loading -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <!-- Operations List -->
          <mat-list *ngIf="!loading && recentOperations.length > 0">
            <mat-list-item *ngFor="let operation of recentOperations; let last = last">
              <div class="operation-item">
                <div class="operation-info">
                  <div class="operation-description">{{ operation.description }}</div>
                  <div class="operation-details">
                    <span class="operation-date">{{ operation.operationTime | date:'dd.MM.yyyy HH:mm' }}</span>
                    <span class="operation-separator">•</span>
                    <span class="operation-account">{{ getAccountName(operation.accountId) }}</span>
                  </div>
                </div>
                <div class="operation-amount" [ngClass]="getOperationTypeClass(operation.operationType)">
                  {{ operation.operationType === OperationType.Income ? '+' : '-' }}
                  {{ operation.amount | currency:'RUB':'symbol':'1.2-2' }}
                </div>
              </div>
              <mat-divider *ngIf="!last"></mat-divider>
            </mat-list-item>
          </mat-list>

          <!-- Empty State -->
          <div *ngIf="!loading && recentOperations.length === 0" class="empty-state">
            <mat-icon>receipt_long</mat-icon>
            <p>Операций пока нет</p>
            <button mat-raised-button color="primary" (click)="navigateToCreateOperation()">
              <mat-icon>add</mat-icon>
              Создать первую операцию
            </button>
          </div>
        </mat-card-content>
        <mat-card-actions *ngIf="!loading && recentOperations.length > 0">
          <button mat-button color="primary" (click)="navigateToOperations()">
            Посмотреть все
            <mat-icon>arrow_forward</mat-icon>
          </button>
          <button mat-raised-button color="primary" (click)="navigateToCreateOperation()">
            <mat-icon>add</mat-icon>
            Добавить операцию
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    mat-card {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      mat-card-header {
        margin-bottom: 20px;

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
          }
        }
      }

      mat-card-content {
        p {
          margin-bottom: 12px;
          font-size: 16px;
        }

        .quick-actions {
          margin-top: 24px;

          h3 {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #333;
          }

          .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;

            button {
              height: 80px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 8px;

              mat-icon {
                font-size: 32px;
                width: 32px;
                height: 32px;
                margin: 0;
              }
            }
          }
        }
      }

      mat-card-actions {
        padding: 16px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;

        button {
          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }

    .operations-card {
      mat-card-content {
        min-height: 200px;

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }

        mat-list {
          padding: 0;

          mat-list-item {
            height: auto;
            padding: 0;

            .operation-item {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px 0;

              .operation-info {
                flex: 1;
                min-width: 0;

                .operation-description {
                  font-size: 16px;
                  font-weight: 500;
                  color: rgba(0, 0, 0, 0.87);
                  margin-bottom: 4px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                .operation-details {
                  font-size: 14px;
                  color: rgba(0, 0, 0, 0.6);
                  display: flex;
                  align-items: center;
                  gap: 8px;

                  .operation-separator {
                    color: rgba(0, 0, 0, 0.3);
                  }
                }
              }

              .operation-amount {
                font-size: 18px;
                font-weight: 600;
                margin-left: 16px;
                white-space: nowrap;

                &.income {
                  color: #2e7d32;
                }

                &.expense {
                  color: #c62828;
                }
              }
            }

            mat-divider {
              margin: 0;
            }
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;

          mat-icon {
            font-size: 64px;
            width: 64px;
            height: 64px;
            color: rgba(0, 0, 0, 0.26);
            margin-bottom: 16px;
          }

          p {
            font-size: 16px;
            color: rgba(0, 0, 0, 0.54);
            margin-bottom: 24px;
          }

          button {
            mat-icon {
              margin-right: 8px;
            }
          }
        }
      }

      mat-card-actions {
        justify-content: space-between;

        button mat-icon {
          margin-left: 8px;
        }
      }
    }

    // Responsive design
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      mat-card {
        mat-card-header mat-card-title {
          font-size: 20px;

          mat-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
          }
        }

        mat-card-content .quick-actions .actions-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .operations-card {
        mat-card-actions {
          flex-direction: column;
          align-items: stretch;

          button {
            width: 100%;
          }
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser = this.authService.getCurrentUser();
  
  // Data streams
  recentOperations: OperationReadDto[] = [];
  loading = false;
  accountsMap = new Map<string, AccountReadDto>();
  
  // Enums for template
  OperationType = OperationType;

  constructor(
    private authService: AuthService,
    private operationService: OperationService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadRecentOperations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load accounts for display
   */
  private loadAccounts(): void {
    this.accountService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.accountsMap.clear();
        result.items.forEach(account => {
          this.accountsMap.set(account.id, account);
        });
      }
    });
  }

  /**
   * Load recent operations
   */
  private loadRecentOperations(): void {
    this.loading = true;
    this.operationService.getAll({ pageNumber: 1, pageSize: 5 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.recentOperations = result.items;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
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
   * Get operation type class
   */
  getOperationTypeClass(type: OperationType): string {
    return type === OperationType.Income ? 'income' : 'expense';
  }

  /**
   * Navigate to accounts
   */
  navigateToAccounts(): void {
    this.router.navigate(['/accounts']);
  }

  /**
   * Navigate to operations
   */
  navigateToOperations(): void {
    this.router.navigate(['/operations']);
  }

  /**
   * Navigate to create operation
   */
  navigateToCreateOperation(): void {
    this.router.navigate(['/operations/create']);
  }

  /**
   * Logout
   */
  logout(): void {
    this.authService.logout();
  }
}
