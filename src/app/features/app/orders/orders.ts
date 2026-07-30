import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../core/services/orders.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { ProductsService } from '../../../core/services/products.service';
import { SitesService } from '../../../core/services/sites.service';
import { PermissionService } from '../../../core/services/permission.service';

import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';

interface OrderLine { product_id: string; quantity_ordered: number; unit_cost: number; }

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './orders.html',
})
export class OrdersComponent implements OnInit {
  private svc         = inject(OrdersService);
  readonly perm       = inject(PermissionService);
  private supplierSvc = inject(SuppliersService);
  private prodSvc     = inject(ProductsService);
  private siteSvc     = inject(SitesService);

  orders    = signal<any[]>([]);
  suppliers = signal<any[]>([]);
  products  = signal<any[]>([]);
  sites     = signal<any[]>([]);
  loading   = signal(true);
  showModal = signal(false);
  showReceive = signal(false);
  saving    = signal(false);
  errors    = signal<string[]>([]);
  selected  = signal<any>(null);

  showConfirm    = signal(false);
  confirmTitle   = signal('');
  confirmMsg     = signal('');
  confirmDanger  = signal(false);
  confirmLabel   = signal('Confirmer');
  private _pendingAction: (() => void) | null = null;

  private askConfirm(title: string, msg: string, danger: boolean, label: string, action: () => void) {
    this.confirmTitle.set(title);
    this.confirmMsg.set(msg);
    this.confirmDanger.set(danger);
    this.confirmLabel.set(label);
    this._pendingAction = action;
    this.showConfirm.set(true);
  }

  onConfirmed() {
    this.showConfirm.set(false);
    this._pendingAction?.();
    this._pendingAction = null;
  }

  form = {
    supplier_id: '', site_id: '',
    reference: '', order_date: new Date().toISOString().split('T')[0],
    expected_date: '', note: '',
  };
  lines: OrderLine[] = [{ product_id: '', quantity_ordered: 1, unit_cost: 0 }];

  ngOnInit() {
    this.load();
    this.supplierSvc.getAll().subscribe({ next: r => this.suppliers.set(r.data ?? []) });
    this.prodSvc.getAll().subscribe({ next: r => this.products.set(r.data ?? []) });
    this.siteSvc.getAll().subscribe({ next: r => this.sites.set(r.data ?? []) });
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (r) => { this.orders.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private generateOrderRef(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const t = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    return `BC-${d}-${t}`;
  }

  openCreate() {
    this.form = {
      supplier_id: '', site_id: '',
      reference: this.generateOrderRef(),
      order_date: new Date().toISOString().split('T')[0],
      expected_date: '', note: '',
    };
    this.lines = [{ product_id: '', quantity_ordered: 1, unit_cost: 0 }];
    this.errors.set([]);
    this.showModal.set(true);
  }

  addLine()             { this.lines.push({ product_id: '', quantity_ordered: 1, unit_cost: 0 }); }
  removeLine(i: number) { if (this.lines.length > 1) this.lines.splice(i, 1); }

  save() {
    this.saving.set(true);
    this.errors.set([]);
    const data: any = {
      supplier_id: this.form.supplier_id,
      site_id:     this.form.site_id,
      reference:   this.form.reference,
      order_date:  this.form.order_date,
      items: this.lines.map(l => ({
        product_id:       l.product_id,
        quantity_ordered: +l.quantity_ordered,
        unit_cost:        +l.unit_cost,
      })),
    };
    if (this.form.expected_date) data.expected_date = this.form.expected_date;
    if (this.form.note)          data.note = this.form.note;

    this.svc.create(data).subscribe({
      next: () => { this.showModal.set(false); this.load(); this.saving.set(false); },
      error: (e) => { this.errors.set(e.error?.errors ?? [e.error?.message ?? 'Erreur']); this.saving.set(false); },
    });
  }

  openReceive(o: any) {
    this.saving.set(false);
    this.errors.set([]);
    this.svc.getById(o.id).subscribe({
      next: r => { this.selected.set(r.data); this.showReceive.set(true); },
      error: () => this.errors.set(['Impossible de charger la commande']),
    });
  }

  receive() {
    const order = this.selected();
    const items = (order.items ?? [])
      .map((i: any) => ({
        id:                i.id,
        quantity_received: parseFloat(i.quantity_ordered) - parseFloat(i.quantity_received ?? 0),
      }))
      .filter((i: any) => i.quantity_received > 0);

    if (!items.length) {
      this.errors.set(['Tous les articles ont déjà été réceptionnés.']);
      return;
    }

    this.saving.set(true);
    this.svc.receive(order.id, { items, received_date: new Date().toISOString().split('T')[0] }).subscribe({
      next: () => { this.showReceive.set(false); this.load(); this.saving.set(false); },
      error: (e) => { this.errors.set(e.error?.errors ?? [e.error?.message ?? 'Erreur']); this.saving.set(false); },
    });
  }

  send(o: any) {
    this.askConfirm('Envoyer la commande', `Confirmer l'envoi de la commande ${o.reference} au fournisseur ?`, false, 'Envoyer', () => {
      this.svc.send(o.id).subscribe({ next: () => this.load() });
    });
  }

  cancel(o: any) {
    this.askConfirm('Annuler la commande', `La commande ${o.reference} sera annulée définitivement.`, true, 'Annuler', () => {
      this.svc.cancel(o.id).subscribe({ next: () => this.load() });
    });
  }

  statusLabel(s: string) {
    const l: Record<string, string> = {
      brouillon: 'Brouillon', envoyee: 'Envoyée',
      recue_totale: 'Reçue', recue_partielle: 'Partielle', annulee: 'Annulée',
    };
    return l[s] ?? s;
  }

  statusClass(s: string) {
    const c: Record<string, string> = {
      brouillon: 'badge-gray', envoyee: 'badge-blue',
      recue_totale: 'badge-green', recue_partielle: 'badge-blue', annulee: 'badge-red',
    };
    return c[s] ?? 'badge-gray';
  }

  remainingItems(order: any): any[] {
    return (order?.items ?? []).filter(
      (i: any) => parseFloat(i.quantity_ordered) - parseFloat(i.quantity_received ?? 0) > 0
    );
  }
}
