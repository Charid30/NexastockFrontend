import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class StockService {
  private api = inject(ApiService);
  getLevels(params = '')    { return this.api.get<any>(`/stock?${params}`); }
  getMovements(params = '') { return this.api.get<any>(`/stock/movements?${params}`); }
  entree(data: any)         { return this.api.post<any>('/stock/entree', data); }
  sortie(data: any)         { return this.api.post<any>('/stock/sortie', data); }
  transfert(data: any)      { return this.api.post<any>('/stock/transfert', data); }
  ajustement(data: any)     { return this.api.post<any>('/stock/ajustement', data); }
}
