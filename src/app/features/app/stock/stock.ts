import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../core/services/stock.service';
import { ProductsService } from '../../../core/services/products.service';
import { SitesService } from '../../../core/services/sites.service';
import { PermissionService } from '../../../core/services/permission.service';

type TabType = 'niveaux' | 'mouvements';
type ActionType = 'entree' | 'sortie' | 'transfert' | 'ajustement';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.html',
})
export class StockComponent implements OnInit {
  private svc      = inject(StockService);
  private prodSvc  = inject(ProductsService);
  private siteSvc  = inject(SitesService);
  readonly perm    = inject(PermissionService);

  tab          = signal<TabType>('niveaux');
  levels       = signal<any[]>([]);
  movements    = signal<any[]>([]);
  products     = signal<any[]>([]);
  sites        = signal<any[]>([]);
  loading      = signal(true);
  showModal    = signal(false);
  saving       = signal(false);
  action       = signal<ActionType>('entree');
  errors       = signal<string[]>([]);

  readonly actions: { key: ActionType; label: string }[] = [
    { key: 'entree',      label: 'Entrée de stock'    },
    { key: 'sortie',      label: 'Sortie de stock'    },
    { key: 'transfert',   label: 'Transfert'          },
    { key: 'ajustement',  label: 'Ajustement'         },
  ];

  form: any = { product_id: '', site_id: '', from_site_id: '', to_site_id: '', quantity: '', reason: '', reference: '', new_quantity: '' };

  ngOnInit() {
    this.prodSvc.getAll().subscribe({ next: r => this.products.set(r.data ?? []) });
    this.siteSvc.getAll().subscribe({ next: r => this.sites.set(r.data ?? []) });
    this.loadLevels();
  }

  loadLevels() {
    this.loading.set(true);
    this.svc.getLevels().subscribe({
      next: (r) => { this.levels.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadMovements() {
    this.loading.set(true);
    this.svc.getMovements().subscribe({
      next: (r) => { this.movements.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  switchTab(t: TabType) {
    this.tab.set(t);
    if (t === 'niveaux') this.loadLevels();
    else this.loadMovements();
  }

  private generateRef(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const t = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    return `ENT-${d}-${t}`;
  }

  openModal(act: ActionType) {
    this.action.set(act);
    this.form = {
      product_id: '', site_id: '', from_site_id: '', to_site_id: '',
      quantity: '', reason: '', new_quantity: '',
      reference: act === 'entree' ? this.generateRef() : '',
    };
    this.errors.set([]);
    this.showModal.set(true);
  }

  save() {
    this.saving.set(true);
    this.errors.set([]);
    let data: any;
    let obs;
    switch (this.action()) {
      case 'entree':
        data = { product_id: this.form.product_id, site_id: this.form.site_id, quantity: +this.form.quantity, reference: this.form.reference || undefined };
        obs = this.svc.entree(data); break;
      case 'sortie':
        data = { product_id: this.form.product_id, site_id: this.form.site_id, quantity: +this.form.quantity, note: this.form.reason || undefined };
        obs = this.svc.sortie(data); break;
      case 'transfert':
        data = { product_id: this.form.product_id, source_site_id: this.form.from_site_id, destination_site_id: this.form.to_site_id, quantity: +this.form.quantity };
        obs = this.svc.transfert(data); break;
      case 'ajustement':
        data = { product_id: this.form.product_id, site_id: this.form.site_id, nouvelle_quantite: +this.form.new_quantity, note: this.form.reason || undefined };
        obs = this.svc.ajustement(data); break;
    }
    obs.subscribe({
      next: () => { this.showModal.set(false); this.saving.set(false); this.loadLevels(); },
      error: (e: any) => { this.errors.set(e.error?.errors ?? [e.error?.message ?? 'Erreur']); this.saving.set(false); },
    });
  }

  typeLabel(type: string) {
    const labels: Record<string, string> = { entree: 'Entrée', sortie: 'Sortie', transfert: 'Transfert', ajustement: 'Ajustement' };
    return labels[type] ?? type;
  }

  siteDisplay(m: any): string {
    if (m.destinationSite) return `${m.sourceSite?.name ?? '?'} → ${m.destinationSite?.name ?? '?'}`;
    return m.sourceSite?.name ?? '—';
  }

  siteTypeLabel(type: string): string {
    const l: Record<string, string> = { entrepot: 'Entrepôt', boutique: 'Boutique', siege: 'Siège', annexe: 'Annexe' };
    return l[type] ?? type;
  }
}
