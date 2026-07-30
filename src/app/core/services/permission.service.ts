import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const BYPASS_ROLES = new Set(['super_admin', 'nexalab_support', 'nexalab_commercial', 'nexalab_technique']);

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly _perms = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (!user) {
        this._perms.set(new Set());
        return;
      }
      if (BYPASS_ROLES.has(user.role as string)) {
        this._perms.set(new Set(['*']));
        return;
      }
      this.http.get<any>(`${environment.apiUrl}/auth/permissions`).subscribe({
        next: (r) => {
          const s = new Set<string>((r.data ?? []).map((p: any) => `${p.module}.${p.action}`));
          this._perms.set(s);
        },
      });
    });
  }

  can(module: string, action: string): boolean {
    const s = this._perms();
    return s.has('*') || s.has(`${module}.${action}`);
  }
}
