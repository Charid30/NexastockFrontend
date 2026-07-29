import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private api = inject(ApiService);
  getAll(params = '')           { return this.api.get<any>(`/users?${params}`); }
  create(data: any)             { return this.api.post<any>('/users', data); }
  update(id: string, data: any) { return this.api.patch<any>(`/users/${id}`, data); }
  assignSites(id: string, site_ids: string[]) { return this.api.put<any>(`/users/${id}/sites`, { site_ids }); }
  remove(id: string)            { return this.api.delete<any>(`/users/${id}`); }
}
