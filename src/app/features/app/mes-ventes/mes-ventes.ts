import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { SalesService } from '../../../core/services/sales.service';

const PM_LABELS: Record<string, string> = {
  especes: 'Espèces', mobile_money: 'Mobile Money',
  carte: 'Carte bancaire', cheque: 'Chèque',
};

type FilterKey = 'today' | 'week' | 'month' | 'all';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week',  label: '7 derniers jours' },
  { key: 'month', label: 'Ce mois' },
  { key: 'all',   label: 'Tout' },
];

@Component({
  selector:    'app-mes-ventes',
  standalone:  true,
  imports:     [DecimalPipe, DatePipe],
  templateUrl: './mes-ventes.html',
})
export class MesVentesComponent implements OnInit {
  private salesService = inject(SalesService);

  readonly FILTERS = FILTERS;

  sales       = signal<any[]>([]);
  totalCount  = signal(0);
  todaySales  = signal<any[]>([]);
  loading     = signal(true);
  activeFilter = signal<FilterKey>('today');
  detail      = signal<any>(null);

  readonly pmLabel = (v: string) => PM_LABELS[v] ?? v;
  readonly itemCount = (s: any) => s.items?.length ?? 0;

  readonly todayTotal = computed(() =>
    this.todaySales().reduce((sum, s) => sum + parseFloat(s.total_amount ?? 0), 0)
  );

  ngOnInit() {
    this.load();
    this.loadToday();
  }

  private dateRange(filter: FilterKey): { date_from?: string; date_to?: string } {
    const now   = new Date();
    const today = now.toISOString().split('T')[0];

    if (filter === 'today') {
      return { date_from: `${today}T00:00:00`, date_to: `${today}T23:59:59` };
    }
    if (filter === 'week') {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { date_from: `${from.toISOString().split('T')[0]}T00:00:00`, date_to: `${today}T23:59:59` };
    }
    if (filter === 'month') {
      return { date_from: `${today.slice(0, 7)}-01T00:00:00`, date_to: `${today}T23:59:59` };
    }
    return {};
  }

  private buildParams(range: { date_from?: string; date_to?: string }): string {
    const p = new URLSearchParams({ limit: '100' });
    if (range.date_from) p.set('date_from', range.date_from);
    if (range.date_to)   p.set('date_to',   range.date_to);
    return p.toString();
  }

  load() {
    this.loading.set(true);
    const params = this.buildParams(this.dateRange(this.activeFilter()));
    this.salesService.getAll(params).subscribe({
      next: (res) => {
        this.sales.set(res.data?.sales ?? []);
        this.totalCount.set(res.data?.total ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadToday() {
    const params = this.buildParams(this.dateRange('today'));
    this.salesService.getAll(params).subscribe({
      next: (res) => this.todaySales.set(res.data?.sales ?? []),
    });
  }

  setFilter(key: FilterKey) {
    this.activeFilter.set(key);
    this.load();
  }

  openDetail(sale: any) { this.detail.set(sale); }
  closeDetail()         { this.detail.set(null); }
}
