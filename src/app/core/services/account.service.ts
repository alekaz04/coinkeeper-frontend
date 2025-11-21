import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '@environments/environment';
import {
  AccountReadDto,
  AccountCreateDto,
  AccountUpdateDto,
  PagedResult,
  PaginationRequest
} from '@core/models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly API_URL = `${environment.apiUrl}/api/account`;
  
  // State management for accounts list
  private accountsSubject = new BehaviorSubject<AccountReadDto[]>([]);
  public accounts$ = this.accountsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all accounts with pagination
   */
  getAll(pagination: PaginationRequest = {}): Observable<PagedResult<AccountReadDto>> {
    const params = new HttpParams()
      .set('pageNumber', pagination.pageNumber?.toString() || '1')
      .set('pageSize', pagination.pageSize?.toString() || '100');

    return this.http.get<PagedResult<AccountReadDto>>(this.API_URL, { params })
      .pipe(
        tap(result => this.accountsSubject.next(result.items))
      );
  }

  /**
   * Get account by ID
   */
  getById(id: string): Observable<AccountReadDto> {
    return this.http.get<AccountReadDto>(`${this.API_URL}/${id}`);
  }

  /**
   * Create new account
   */
  create(data: AccountCreateDto): Observable<string> {
    return this.http.post<string>(this.API_URL, data);
  }

  /**
   * Update existing account
   */
  update(id: string, data: AccountUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Delete account
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Calculate total balance across all accounts
   */
  getTotalBalance(): number {
    const accounts = this.accountsSubject.value;
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  /**
   * Refresh accounts list
   */
  refresh(): void {
    this.getAll().subscribe();
  }
}
