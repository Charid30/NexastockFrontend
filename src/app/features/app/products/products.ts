import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { UnitsService } from '../../../core/services/units.service';
import { PermissionService } from '../../../core/services/permission.service';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './products.html',
})
export class ProductsComponent implements OnInit {
  private svc      = inject(ProductsService);
  private catSvc   = inject(CategoriesService);
  private unitSvc  = inject(UnitsService);
  readonly perm    = inject(PermissionService);

  products   = signal<any[]>([]);
  categories = signal<any[]>([]);
  units      = signal<any[]>([]);
  loading    = signal(true);
  showModal  = signal(false);
  showDetail = signal(false);
  detailItem = signal<any>(null);
  saving     = signal(false);
  editing    = signal<any>(null);
  errors     = signal<string[]>([]);

  openDetail(p: any) { this.detailItem.set(p); this.showDetail.set(true); }

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

  search = '';

  form = { name: '', description: '', cost_price: '', selling_price: '', category_id: '', unit_id: '' };

  ngOnInit() {
    this.load();
    this.catSvc.getAll().subscribe({ next: r => this.categories.set(r.data ?? []) });
    this.unitSvc.getAll().subscribe({ next: r => this.units.set(r.data ?? []) });
  }

  referenceFor(name: string): string {
    if (!name) return '';
    return name
      .toUpperCase()
      .normalize('NFD')
      .replace(/\p{Mn}/gu, '')
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  load() {
    this.loading.set(true);
    const q = this.search ? `search=${this.search}` : '';
    this.svc.getAll(q).subscribe({
      next: (r) => { this.products.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form = { name: '', description: '', cost_price: '', selling_price: '', category_id: '', unit_id: '' };
    this.errors.set([]);
    this.showModal.set(true);
  }

  openEdit(p: any) {
    this.editing.set(p);
    this.form = {
      name: p.name, description: p.description ?? '',
      cost_price: p.cost_price ?? '', selling_price: p.selling_price ?? '',
      category_id: p.category_id ?? '', unit_id: p.unit_id ?? '',
    };
    this.errors.set([]);
    this.showModal.set(true);
  }

  save() {
    this.saving.set(true);
    this.errors.set([]);
    const data: any = { ...this.form };
    const ref = this.referenceFor(data.name);
    if (ref) data.reference = ref;
    if (!data.description) delete data.description;
    if (!data.category_id) delete data.category_id;
    if (!data.unit_id)     delete data.unit_id;
    if (data.cost_price)     data.cost_price     = +data.cost_price;
    else                     delete data.cost_price;
    if (data.selling_price)  data.selling_price  = +data.selling_price;
    else                     delete data.selling_price;

    const obs = this.editing()
      ? this.svc.update(this.editing().id, data)
      : this.svc.create(data);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.load(); this.saving.set(false); },
      error: (e) => { this.errors.set(e.error?.errors ?? [e.error?.message ?? 'Erreur']); this.saving.set(false); },
    });
  }

  remove(p: any) {
    this.askConfirm('Supprimer le produit', `"${p.name}" sera supprimé définitivement.`, () => {
      this.svc.remove(p.id).subscribe({ next: () => this.load() });
    });
  }

  onSearch() { this.load(); }
}
