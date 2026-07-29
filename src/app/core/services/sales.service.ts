import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private api = inject(ApiService);

  create(data: any)              { return this.api.post<any>('/sales', data); }
  getAll(params = '')            { return this.api.get<any>(`/sales?${params}`); }
  getById(id: string)            { return this.api.get<any>(`/sales/${id}`); }
}
