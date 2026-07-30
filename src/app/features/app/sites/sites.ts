import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SitesService } from '../../../core/services/sites.service';
import { PermissionService } from '../../../core/services/permission.service';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './sites.html',
})
export class SitesComponent implements OnInit {
  private svc  = inject(SitesService);
  readonly perm = inject(PermissionService);

  sites     = signal<any[]>([]);
  loading    = signal(true);
  loadError  = signal('');
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

  form = { name: '', type: 'boutique', address: '', phone: '' };
  readonly types = ['boutique', 'entrepot', 'annexe'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.loadError.set('');
    this.svc.getAll().subscribe({
      next: (r) => { this.sites.set(r.data ?? []); this.loading.set(false); },
      error: (e) => {
        this.loadError.set(e.error?.message ?? 'Impossible de charger les sites.');
        this.loading.set(false);
      },
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form = { name: '', type: 'boutique', address: '', phone: '' };
    this.errors.set([]);
    this.showModal.set(true);
  }

  openEdit(site: any) {
    this.editing.set(site);
    this.form = { name: site.name, type: site.type, address: site.address ?? '', phone: site.phone ?? '' };
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

  remove(site: any) {
    this.askConfirm('Supprimer le site', `Le site "${site.name}" sera supprimé définitivement.`, () => {
      this.svc.remove(site.id).subscribe({ next: () => this.load() });
    });
  }
}
