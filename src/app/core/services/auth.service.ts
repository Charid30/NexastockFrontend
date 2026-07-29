import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(this._loadUser());

  readonly user         = this._user.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._user());
  readonly isSuperAdmin = computed(() => this._user()?.role === 'super_admin');
  readonly isTenantAdmin = computed(() => this._user()?.role === 'tenant_admin');

  register(data: Record<string, unknown>) {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap((res) => this._setSession(res.data)),
    );
  }

  login(phone: string, password: string) {
    return this.http.post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, { phone, password }).pipe(
      tap((res) => this._setSession(res.data)),
    );
  }

  logout() {
    const token = localStorage.getItem('refresh_token');
    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refresh_token: token }).subscribe();
    }
    this._clearSession();
    this.router.navigate(['/connexion']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  refreshToken() {
    const refresh_token = this.getRefreshToken();
    return this.http.post<ApiResponse<{ accessToken: string }>>(`${environment.apiUrl}/auth/refresh`, { refresh_token }).pipe(
      tap((res) => localStorage.setItem('access_token', res.data.accessToken)),
    );
  }

  private _setSession(data: AuthResponse) {
    localStorage.setItem('access_token',  data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    this._user.set(data.user);
  }

  private _clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this._user.set(null);
  }

  private _loadUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
