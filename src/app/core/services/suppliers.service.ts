import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private api = inject(ApiService);
  getAll(params = '')           { return this.api.get<any>(`/suppliers?${params}`); }
  getById(id: string)           { return this.api.get<any>(`/suppliers/${id}`); }
  create(data: any)             { return this.api.post<any>('/suppliers', data); }
  update(id: string, data: any) { return this.api.patch<any>(`/suppliers/${id}`, data); }
  remove(id: string)            { return this.api.delete<any>(`/suppliers/${id}`); }
}
