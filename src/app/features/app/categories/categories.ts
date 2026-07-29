import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesService } from '../../../core/services/categories.service';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './categories.html',
})
export class CategoriesComponent implements OnInit {
  private svc = inject(CategoriesService);

  categories = signal<any[]>([]);
  loading    = signal(true);
  showModal  = signal(false);
  showDetail = signal(false);
  detailItem = signal<any>(null);
  saving     = signal(false);
  editing    = signal<any>(null);
  errors     = signal<string[]>([]);

  openDetail(c: any) { this.detailItem.set(c); this.showDetail.set(true); }

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

  form = { name: '', description: '', parent_id: '' };

  get rootCategories() { return this.categories().filter(c => !c.parent_id); }
  get parentOptions()  { return this.categories().filter(c => !c.parent_id && c.id !== this.editing()?.id); }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (r) => { this.categories.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form = { name: '', description: '', parent_id: '' };
    this.errors.set([]);
    this.showModal.set(true);
  }

  openEdit(c: any) {
    this.editing.set(c);
    this.form = { name: c.name, description: c.description ?? '', parent_id: c.parent_id ?? '' };
    this.errors.set([]);
    this.showModal.set(true);
  }

  save() {
    this.saving.set(true);
    this.errors.set([]);
    const data: any = { ...this.form };
    if (!data.parent_id) delete data.parent_id;
    if (!data.description) delete data.description;
    const obs = this.editing()
      ? this.svc.update(this.editing().id, data)
      : this.svc.create(data);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.load(); this.saving.set(false); },
      error: (e) => { this.errors.set(e.error?.errors ?? [e.error?.message ?? 'Erreur']); this.saving.set(false); },
    });
  }

  remove(c: any) {
    this.askConfirm('Supprimer la catégorie', `"${c.name}" sera supprimée définitivement.`, () => {
      this.svc.remove(c.id).subscribe({ next: () => this.load() });
    });
  }

  parentName(id: string) {
    return this.categories().find(c => c.id === id)?.name ?? '—';
  }
}
