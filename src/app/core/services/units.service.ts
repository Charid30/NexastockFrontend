import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UnitsService {
  private api = inject(ApiService);
  getAll()                          { return this.api.get<any>('/units'); }
  create(data: any)                 { return this.api.post<any>('/units', data); }
  update(id: string, data: any)     { return this.api.patch<any>(`/units/${id}`, data); }
  remove(id: string)                { return this.api.delete<any>(`/units/${id}`); }
}
