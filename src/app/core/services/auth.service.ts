import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { RequestUserDto, UserResponseDto, AuthToken } from '@core/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api`;
  private currentUserSubject = new BehaviorSubject<UserResponseDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  /**
   * Регистрация нового пользователя
   */
  register(data: RequestUserDto): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/user`, data);
  }

  /**
   * Вход в систему
   */
  login(credentials: RequestUserDto): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.API_URL}/auth`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setTokens(response.token);
            this.setCurrentUser(response);
            this.currentUserSubject.next(response);
          }
        })
      );
  }

  /**
   * Обновление токена
   */
  refreshToken(): Observable<AuthToken> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.get<AuthToken>(`${this.API_URL}/auth`, {
      params: { refreshToken }
    }).pipe(
      tap(token => this.setTokens(token))
    );
  }

  /**
   * Выход из системы
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Получить access token
   */
  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * Получить refresh token
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('refreshToken');
  }

  /**
   * Проверка авторизации
   */
  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return !!this.getAccessToken();
  }

  /**
   * Получить текущего пользователя
   */
  getCurrentUser(): UserResponseDto | null {
    return this.currentUserSubject.value;
  }

  /**
   * Сохранить токены в localStorage
   */
  private setTokens(token: AuthToken): void {
    if (!this.isBrowser) return;
    localStorage.setItem('accessToken', token.accessToken);
    localStorage.setItem('refreshToken', token.refreshToken);
  }

  /**
   * Сохранить текущего пользователя в localStorage
   */
  private setCurrentUser(user: UserResponseDto): void {
    if (!this.isBrowser) return;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Загрузить пользователя из localStorage при инициализации
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Failed to parse user from storage:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }
}
