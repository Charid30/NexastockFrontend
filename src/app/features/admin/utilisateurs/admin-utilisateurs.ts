import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminUtilisateursService } from '../../../core/services/admin-utilisateurs.service';
import { TenantsAdminService } from '../../../core/services/tenants-admin.service';

const TENANT_ROLES = [
  { value: 'tenant_admin', label: 'Administrateur' },
  { value: 'manager',      label: 'Manager' },
  { value: 'caissier',     label: 'Caissier' },
  { value: 'magasinier',   label: 'Magasinier' },
  { value: 'auditeur',     label: 'Auditeur' },
  { value: 'livreur',      label: 'Livreur' },
];

@Component({
  selector: 'app-admin-utilisateurs',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-utilisateurs.html',
})
export class AdminUtilisateursComponent implements OnInit {
  private readonly svc        = inject(AdminUtilisateursService);
  private readonly tenantsSvc = inject(TenantsAdminService);

  readonly roles      = TENANT_ROLES;
  readonly users      = signal<any[]>([]);
  readonly total      = signal(0);
  readonly tenants    = signal<any[]>([]);
  readonly loading    = signal(false);

  search      = '';
  roleFilter  = '';
  tenantFilter = '';
  activeFilter = '';

  ngOnInit() {
    this.loadTenants();
    this.load();
  }

  loadTenants() {
    this.tenantsSvc.getAll('limit=200').subscribe({
      next: (r: any) => this.tenants.set(r.data.data ?? []),
    });
  }

  load() {
    this.loading.set(true);
    this.svc.getAll({
      search:    this.search,
      role:      this.roleFilter,
      tenant_id: this.tenantFilter,
      is_active: this.activeFilter,
    }).subscribe({
      next: (r: any) => { this.users.set(r.data.data); this.total.set(r.data.total); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  toggle(user: any) {
    this.svc.toggle(user.id).subscribe({ next: () => this.load() });
  }

  roleLabel(name: string) {
    return TENANT_ROLES.find(r => r.value === name)?.label ?? name;
  }
}
