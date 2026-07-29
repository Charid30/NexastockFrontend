import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TenantsAdminService {
  private api = inject(ApiService);

  getStats()              { return this.api.get<any>('/admin/tenants/stats'); }
  getAll(params = '')     { return this.api.get<any>(`/admin/tenants?${params}`); }
  getById(id: string)     { return this.api.get<any>(`/admin/tenants/${id}`); }
  update(id: string, data: any) { return this.api.patch<any>(`/admin/tenants/${id}`, data); }
  toggleModule(id: string, module_code: string, is_active: boolean) {
    return this.api.patch<any>(`/admin/tenants/${id}/modules`, { module_code, is_active });
  }
}
