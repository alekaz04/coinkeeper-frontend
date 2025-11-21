import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dashboard-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>dashboard</mat-icon>
            Добро пожаловать в CoinKeeper!
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Вы успешно вошли в систему.</p>
          <p *ngIf="currentUser">Email: {{ currentUser.login }}</p>
          <p class="info-text">
            Дашборд находится в разработке. Здесь будет отображаться статистика ваших финансов.
          </p>

          <div class="quick-actions">
            <h3>Быстрые действия</h3>
            <div class="actions-grid">
              <button mat-raised-button color="primary" (click)="navigateToAccounts()">
                <mat-icon>account_balance_wallet</mat-icon>
                Управление счетами
              </button>
              <button mat-raised-button disabled>
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
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 40px 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    mat-card {
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

        .info-text {
          color: rgba(0, 0, 0, 0.6);
          font-style: italic;
          margin-bottom: 24px;
        }

        .quick-actions {
          margin-top: 32px;

          h3 {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #333;
          }

          .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

        button {
          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }
  `]
})
export class DashboardComponent {
  currentUser = this.authService.getCurrentUser();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  navigateToAccounts(): void {
    this.router.navigate(['/accounts']);
  }

  logout(): void {
    this.authService.logout();
  }
}
