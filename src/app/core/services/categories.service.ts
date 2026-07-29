import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private api = inject(ApiService);
  getAll()                          { return this.api.get<any>('/categories'); }
  create(data: any)                 { return this.api.post<any>('/categories', data); }
  update(id: string, data: any)     { return this.api.patch<any>(`/categories/${id}`, data); }
  remove(id: string)                { return this.api.delete<any>(`/categories/${id}`); }
}
