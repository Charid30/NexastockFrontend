import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './suppliers.html',
})
export class SuppliersComponent implements OnInit {
  private svc = inject(SuppliersService);

  suppliers  = signal<any[]>([]);
  loading    = signal(true);
  showModal  = signal(false);
  showDetail = signal(false);
  detailItem = signal<any>(null);
  saving     = signal(false);
  editing    = signal<any>(null);
  errors     = signal<string[]>([]);

  openDetail(s: any) { this.detailItem.set(s); this.showDetail.set(true); }

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

  form = { name: '', email: '', phone: '', address: '', contact_person: '' };

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (r) => { this.suppliers.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form = { name: '', email: '', phone: '', address: '', contact_person: '' };
    this.errors.set([]);
    this.showModal.set(true);
  }

  openEdit(s: any) {
    this.editing.set(s);
    this.form = { name: s.name, email: s.email ?? '', phone: s.phone ?? '', address: s.address ?? '', contact_person: s.contact_person ?? '' };
    this.errors.set([]);
    this.showModal.set(true);
  }

  save() {
    this.saving.set(true);
    this.errors.set([]);
    const data: any = { ...this.form };
    ['email', 'phone', 'address', 'contact_person'].forEach(k => { if (!data[k]) delete data[k]; });
    const obs = this.editing()
      ? this.svc.update(this.editing().id, data)
      : this.svc.create(data);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.load(); this.saving.set(false); },
      error: (e) => { this.errors.set(e.error?.errors ?? [e.error?.message ?? 'Erreur']); this.saving.set(false); },
    });
  }

  remove(s: any) {
    this.askConfirm('Supprimer le fournisseur', `"${s.name}" sera supprimé définitivement.`, () => {
      this.svc.remove(s.id).subscribe({ next: () => this.load() });
    });
  }
}
