import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private api = inject(ApiService);
  getDashboard()        { return this.api.get<any>('/reports/dashboard'); }
  getStockValue()       { return this.api.get<any>('/reports/stock-valuation'); }
  getLowStock()         { return this.api.get<any>('/reports/low-stock'); }
  getMovements(p = '')  { return this.api.get<any>(`/stock/movements?${p}`); }
}
