import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TenantsAdminService } from '../../../core/services/tenants-admin.service';

@Component({
  selector:    'app-admin-dashboard',
  standalone:  true,
  imports:     [RouterLink],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  private svc = inject(TenantsAdminService);

  stats   = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    this.svc.getStats().subscribe({
      next: (res) => { this.stats.set(res.data); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }
}
