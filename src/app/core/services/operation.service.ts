import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  OperationReadDto,
  OperationCreateDto,
  OperationUpdateDto
} from '../models/operation.model';
import { PagedResult, PaginationRequest } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private readonly API_URL = `${environment.apiUrl}/operation`;

  // State management
  private operationsSubject = new BehaviorSubject<OperationReadDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private totalCountSubject = new BehaviorSubject<number>(0);

  // Public observables
  public operations$ = this.operationsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public totalCount$ = this.totalCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load operations with pagination
   */
  loadOperations(pagination: PaginationRequest = {}): void {
    this.loadingSubject.next(true);

    this.getAll(pagination)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (result) => {
          this.operationsSubject.next(result.items);
          this.totalCountSubject.next(result.totalCount);
        },
        error: (error) => {
          console.error('Failed to load operations:', error);
          this.operationsSubject.next([]);
        }
      });
  }

  /**
   * Get all operations with pagination
   */
  getAll(pagination: PaginationRequest = {}): Observable<PagedResult<OperationReadDto>> {
    const params = new HttpParams()
      .set('pageNumber', pagination.pageNumber?.toString() || '1')
      .set('pageSize', pagination.pageSize?.toString() || '10');

    return this.http.get<PagedResult<OperationReadDto>>(this.API_URL, { params });
  }

  /**
   * Get operation by ID
   */
  getById(id: string): Observable<OperationReadDto> {
    return this.http.get<OperationReadDto>(`${this.API_URL}/${id}`);
  }

  /**
   * Create new operation
   */
  create(data: OperationCreateDto): Observable<string> {
    return this.http.post<string>(this.API_URL, data).pipe(
      tap(() => {
        // Reload operations after creation
        this.loadOperations();
      })
    );
  }

  /**
   * Update existing operation
   */
  update(id: string, data: OperationUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, data).pipe(
      tap(() => {
        // Reload operations after update
        this.loadOperations();
      })
    );
  }

  /**
   * Delete operation
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // Reload operations after deletion
        this.loadOperations();
      })
    );
  }

  /**
   * Clear operations state
   */
  clearOperations(): void {
    this.operationsSubject.next([]);
    this.totalCountSubject.next(0);
  }
}
