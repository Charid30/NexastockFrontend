import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TenantsAdminService } from '../../../core/services/tenants-admin.service';

const MODULE_LABELS: Record<string, string> = {
  MULTI_WAREHOUSE: 'Multi-entrepôts',
  ALERTS:          'Alertes',
  REPORTS:         'Rapports',
  SUPPLIERS:       'Fournisseurs',
  ORDERS:          'Commandes',
};

@Component({
  selector:    'app-admin-organisations',
  standalone:  true,
  imports:     [FormsModule, DatePipe],
  templateUrl: './admin-organisations.html',
})
export class AdminOrganisationsComponent implements OnInit {
  private svc = inject(TenantsAdminService);

  tenants    = signal<any[]>([]);
  total      = signal(0);
  loading    = signal(true);
  detail     = signal<any>(null);
  saving     = signal(false);
  search     = '';

  readonly moduleLabel = (code: string) => MODULE_LABELS[code] ?? code;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const q = this.search ? `search=${this.search}` : '';
    this.svc.getAll(q).subscribe({
      next: (res) => {
        this.tenants.set(res.data?.tenants ?? res.data ?? []);
        this.total.set(res.data?.total ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openDetail(id: string) {
    this.svc.getById(id).subscribe({
      next: (res) => this.detail.set(res.data),
    });
  }

  closeDetail() { this.detail.set(null); }

  toggleActive() {
    const t = this.detail();
    if (!t) return;
    this.saving.set(true);
    this.svc.update(t.id, { is_active: t.is_active ? 0 : 1 }).subscribe({
      next: (res) => {
        this.detail.update(d => ({ ...d, is_active: res.data.is_active }));
        this.load();
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  toggleModule(mod: any) {
    const t = this.detail();
    if (!t) return;
    const newVal = mod.is_active ? 0 : 1;
    this.svc.toggleModule(t.id, mod.module_code, !!newVal).subscribe({
      next: () => {
        this.detail.update(d => ({
          ...d,
          modules: d.modules.map((m: any) =>
            m.module_code === mod.module_code ? { ...m, is_active: newVal } : m
          ),
        }));
      },
    });
  }

  onSearch() { this.load(); }

  activeModules(tenant: any): string {
    return (tenant.modules ?? [])
      .filter((m: any) => m.is_active)
      .map((m: any) => this.moduleLabel(m.module_code))
      .join(', ') || '—';
  }
}
