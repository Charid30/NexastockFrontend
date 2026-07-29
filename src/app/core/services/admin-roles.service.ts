import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminRolesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin/roles`;

  getRoles(type?: string) {
    let p = new HttpParams();
    if (type) p = p.set('type', type);
    return this.http.get<any>(this.base, { params: p });
  }

  getRole(id: string) {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  createRole(data: any) {
    return this.http.post<any>(this.base, data);
  }

  updateRole(id: string, data: any) {
    return this.http.put<any>(`${this.base}/${id}`, data);
  }

  deleteRole(id: string) {
    return this.http.delete<any>(`${this.base}/${id}`);
  }

  getPermissions() {
    return this.http.get<any>(`${this.base}/permissions`);
  }

  getRolePermissions(roleId: string) {
    return this.http.get<any>(`${this.base}/${roleId}/permissions`);
  }

  setRolePermissions(roleId: string, permissionIds: string[]) {
    return this.http.put<any>(`${this.base}/${roleId}/permissions`, { permission_ids: permissionIds });
  }
}
