import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private api = inject(ApiService);
  get()               { return this.api.get<any>('/company'); }
  update(data: any)   { return this.api.patch<any>('/company', data); }
  updateLogo(fd: FormData) { return this.api.patch<any>('/company/logo', fd); }
}
