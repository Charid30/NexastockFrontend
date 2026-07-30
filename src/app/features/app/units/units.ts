import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitsService } from '../../../core/services/units.service';
import { PermissionService } from '../../../core/services/permission.service';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './units.html',
})
export class UnitsComponent implements OnInit {
  private svc  = inject(UnitsService);
  readonly perm = inject(PermissionService);

  units      = signal<any[]>([]);
  loading    = signal(true);
  showModal  = signal(false);
  showDetail = signal(false);
  detailItem = signal<any>(null);
  saving     = signal(false);
  editing    = signal<any>(null);
  errors     = signal<string[]>([]);

  openDetail(u: any) { this.detailItem.set(u); this.showDetail.set(true); }

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

  form = { name: '', abbreviation: '' };

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (r) => { this.units.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form = { name: '', abbreviation: '' };
    this.errors.set([]);
    this.showModal.set(true);
  }

  openEdit(u: any) {
    this.editing.set(u);
    this.form = { name: u.name, abbreviation: u.abbreviation };
    this.errors.set([]);
    this.showModal.set(true);
  }

  save() {
    this.saving.set(true);
    this.errors.set([]);
    const obs = this.editing()
      ? this.svc.update(this.editing().id, this.form)
      : this.svc.create(this.form);
    obs.subscribe({
      next: () => { this.showModal.set(false); this.load(); this.saving.set(false); },
      error: (e) => { this.errors.set(e.error?.errors ?? [e.error?.message ?? 'Erreur']); this.saving.set(false); },
    });
  }

  remove(u: any) {
    this.askConfirm('Supprimer l\'unité', `L'unité "${u.name}" sera supprimée définitivement.`, () => {
      this.svc.remove(u.id).subscribe({ next: () => this.load() });
    });
  }
}
