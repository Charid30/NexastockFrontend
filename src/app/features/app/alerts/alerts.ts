import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertsService } from '../../../core/services/alerts.service';
import { ProductsService } from '../../../core/services/products.service';
import { SitesService } from '../../../core/services/sites.service';
import { PermissionService } from '../../../core/services/permission.service';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './alerts.html',
})
export class AlertsComponent implements OnInit {
  readonly perm = inject(PermissionService);
  private svc     = inject(AlertsService);
  private prodSvc = inject(ProductsService);
  private siteSvc = inject(SitesService);

  alerts     = signal<any[]>([]);
  products   = signal<any[]>([]);
  sites      = signal<any[]>([]);
  loading    = signal(true);
  showModal  = signal(false);
  showDetail = signal(false);
  detailItem = signal<any>(null);
  saving     = signal(false);
  editing    = signal<any>(null);
  errors     = signal<string[]>([]);

  openDetail(a: any) { this.detailItem.set(a); this.showDetail.set(true); }

  showConfirm  = signal(false);
  confirmTitle = signal('');
  confirmMsg   = signal('');
  private _pendingAction: (() => void) | null = null;

  private askConfirm(title: string, msg: string, action: () => void) {
    this.confirmTitle.set(title);
    this.confirmMsg.set(msg);
    this._pendingAction = action;
    this.showConfirm.set(true);
  }

  onConfirmed() {
    this.showConfirm.set(false);
    this._pendingAction?.();
    this._pendingAction = null;
  }

  readonly types = ['stock_bas', 'rupture'];

  form = { product_id: '', site_id: '', type: 'stock_bas', threshold: '' };

  ngOnInit() {
    this.load();
    this.prodSvc.getAll().subscribe({ next: r => this.products.set(r.data ?? []) });
    this.siteSvc.getAll().subscribe({ next: r => this.sites.set(r.data ?? []) });
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (r) => { this.alerts.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form = { product_id: '', site_id: '', type: 'stock_bas', threshold: '' };
    this.errors.set([]);
    this.showModal.set(true);
  }

  openEdit(a: any) {
    this.editing.set(a);
    this.form = { product_id: a.product_id, site_id: a.site_id ?? '', type: a.type, threshold: a.threshold_quantity };
    this.errors.set([]);
    this.showModal.set(true);
  }

  save() {
    this.saving.set(true);
    this.errors.set([]);
    let data: any;
    if (this.editing()) {
      data = { threshold_quantity: +this.form.threshold };
    } else {
      data = { product_id: this.form.product_id, type: this.form.type, threshold_quantity: +this.form.threshold };
      if (this.form.site_id) data.site_id = this.form.site_id;
    }
    const obs = this.editing()
      ? this.svc.update(this.editing().id, data)
      : this.svc.create(data);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.load(); this.saving.set(false); },
      error: (e) => { this.errors.set(e.error?.errors ?? [e.error?.message ?? 'Erreur']); this.saving.set(false); },
    });
  }

  remove(a: any) {
    this.askConfirm('Supprimer l\'alerte', 'Cette alerte sera supprimée définitivement.', () => {
      this.svc.remove(a.id).subscribe({ next: () => this.load() });
    });
  }

  typeLabel(t: string) {
    const l: Record<string, string> = { stock_bas: 'Stock bas', rupture: 'Rupture' };
    return l[t] ?? t;
  }
}
