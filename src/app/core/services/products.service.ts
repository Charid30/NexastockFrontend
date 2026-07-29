import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private api = inject(ApiService);
  getAll(params = '')           { return this.api.get<any>(`/products?${params}`); }
  getById(id: string)           { return this.api.get<any>(`/products/${id}`); }
  create(data: any)             { return this.api.post<any>('/products', data); }
  update(id: string, data: any) { return this.api.patch<any>(`/products/${id}`, data); }
  remove(id: string)            { return this.api.delete<any>(`/products/${id}`); }
}
