import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private api = inject(ApiService);
  getAll(params = '')           { return this.api.get<any>(`/orders?${params}`); }
  getById(id: string)           { return this.api.get<any>(`/orders/${id}`); }
  create(data: any)             { return this.api.post<any>('/orders', data); }
  send(id: string)              { return this.api.patch<any>(`/orders/${id}/send`, {}); }
  receive(id: string, data: any){ return this.api.post<any>(`/orders/${id}/receive`, data); }
  cancel(id: string)            { return this.api.patch<any>(`/orders/${id}/cancel`, {}); }
}
