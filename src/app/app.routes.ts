import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  // Редирект с корня на login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Маршруты аутентификации
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Защищенные маршруты (требуют аутентификации)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadComponent: () => import('./features/accounts/accounts-list/accounts-list.component').then(m => m.AccountsListComponent)
  },
  {
    path: 'operations',
    canActivate: [authGuard],
    loadChildren: () => import('./features/operations/operations.module').then(m => m.OperationsModule)
  },

  // Wildcard route - редирект на login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
