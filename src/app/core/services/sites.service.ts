import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SitesService {
  private api = inject(ApiService);
  getAll()             { return this.api.get<any>('/sites'); }
  create(data: any)    { return this.api.post<any>('/sites', data); }
  update(id: string, data: any) { return this.api.patch<any>(`/sites/${id}`, data); }
  remove(id: string)   { return this.api.delete<any>(`/sites/${id}`); }
}
