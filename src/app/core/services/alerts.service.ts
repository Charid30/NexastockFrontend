import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private api = inject(ApiService);
  getAll(params = '')           { return this.api.get<any>(`/alerts?${params}`); }
  getLogs(id: string)           { return this.api.get<any>(`/alerts/${id}/logs`); }
  create(data: any)             { return this.api.post<any>('/alerts', data); }
  update(id: string, data: any) { return this.api.patch<any>(`/alerts/${id}`, data); }
  remove(id: string)            { return this.api.delete<any>(`/alerts/${id}`); }
}
