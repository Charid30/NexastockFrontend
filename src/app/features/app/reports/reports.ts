import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../../core/services/reports.service';

type ReportTab = 'valeur' | 'stock_bas' | 'mouvements';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
})
export class ReportsComponent implements OnInit {
  private svc = inject(ReportsService);

  tab      = signal<ReportTab>('valeur');
  data     = signal<any[]>([]);
  loading  = signal(true);
  valTotal = signal<number>(0);

  ngOnInit() { this.load('valeur'); }

  load(tab: ReportTab) {
    this.tab.set(tab);
    this.loading.set(true);
    this.data.set([]);
    this.valTotal.set(0);

    if (tab === 'valeur') {
      this.svc.getStockValue().subscribe({
        next: (r) => {
          this.valTotal.set(r.data?.total_cost_value ?? 0);
          this.data.set(r.data?.lines ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else if (tab === 'stock_bas') {
      this.svc.getLowStock().subscribe({
        next: (r) => { this.data.set(r.data ?? []); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      this.svc.getMovements().subscribe({
        next: (r) => { this.data.set(r.data ?? []); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    }
  }

  typeLabel(t: string) {
    const l: Record<string, string> = { entree: 'Entrée', sortie: 'Sortie', transfert: 'Transfert', ajustement: 'Ajustement' };
    return l[t] ?? t;
  }
}
