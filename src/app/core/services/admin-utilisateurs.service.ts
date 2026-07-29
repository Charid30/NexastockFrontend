import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminUtilisateursService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin/utilisateurs`;

  getAll(params: Record<string, any> = {}) {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== '' && v != null) p = p.set(k, v); });
    return this.http.get<any>(this.base, { params: p });
  }

  toggle(id: string) {
    return this.http.patch<any>(`${this.base}/${id}/toggle`, {});
  }
}
