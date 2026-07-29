import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company.html',
})
export class CompanyComponent implements OnInit {
  private svc = inject(CompanyService);

  company  = signal<any>(null);
  loading  = signal(true);
  saving   = signal(false);
  errors   = signal<string[]>([]);
  success  = signal(false);

  form = { name: '', legal_name: '', tax_number: '', address: '', phone: '', email: '', website: '' };

  ngOnInit() {
    this.svc.get().subscribe({
      next: (r) => {
        const c = r.data;
        this.company.set(c);
        this.form = {
          name:       c.name ?? '',
          legal_name: c.legal_name ?? '',
          tax_number: c.tax_number ?? '',
          address:    c.address ?? '',
          phone:      c.phone ?? '',
          email:      c.email ?? '',
          website:    c.website ?? '',
        };
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save() {
    this.saving.set(true);
    this.errors.set([]);
    this.success.set(false);
    const data: any = { ...this.form };
    ['legal_name', 'tax_number', 'address', 'phone', 'email', 'website'].forEach(k => { if (!data[k]) delete data[k]; });
    this.svc.update(data).subscribe({
      next: () => { this.success.set(true); this.saving.set(false); },
      error: (e) => { this.errors.set(e.error?.errors ?? [e.error?.message ?? 'Erreur']); this.saving.set(false); },
    });
  }
}
