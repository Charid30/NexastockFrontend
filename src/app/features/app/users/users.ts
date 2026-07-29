import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { SitesService } from '../../../core/services/sites.service';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  private svc     = inject(UsersService);
  private siteSvc = inject(SitesService);

  users     = signal<any[]>([]);
  sites     = signal<any[]>([]);
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

  step         = signal<1 | 2 | 3>(1);
  selectedSites = signal<string[]>([]);

  readonly roles = ['manager', 'caissier', 'magasinier', 'auditeur', 'livreur'];

  form = { first_name: '', last_name: '', email: '', phone: '', role: 'caissier', password: '' };

  ngOnInit() {
    this.load();
    this.siteSvc.getAll().subscribe({ next: r => this.sites.set(r.data ?? []) });
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: r => { this.users.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form = { first_name: '', last_name: '', email: '', phone: '', role: 'caissier', password: '' };
    this.selectedSites.set([]);
    this.errors.set([]);
    this.step.set(1);
    this.showModal.set(true);
  }

  openEdit(u: any) {
    this.editing.set(u);
    this.form = {
      first_name: u.first_name, last_name: u.last_name,
      email: u.email, phone: u.phone ?? '',
      role: u.role, password: '',
    };
    this.selectedSites.set((u.sites ?? []).map((s: any) => s.id));
    this.errors.set([]);
    this.step.set(1);
    this.showModal.set(true);
  }

  nextStep() {
    this.errors.set([]);
    if (this.step() === 1) {
      if (!this.form.first_name || !this.form.last_name) {
        this.errors.set(['Veuillez renseigner le prénom et le nom.']);
        return;
      }
      this.step.set(2);
    } else if (this.step() === 2) {
      if (!this.form.email) {
        this.errors.set(['L\'email est obligatoire.']);
        return;
      }
      if (!this.editing() && !this.form.password) {
        this.errors.set(['Le mot de passe est requis.']);
        return;
      }
      this.step.set(3);
    }
  }

  toggleSite(id: string) {
    const curr = this.selectedSites();
    this.selectedSites.set(curr.includes(id) ? curr.filter(s => s !== id) : [...curr, id]);
  }

  save() {
    this.saving.set(true);
    this.errors.set([]);

    const data: any = { ...this.form, site_ids: this.selectedSites() };
    if (!data.password) delete data.password;
    if (!data.email)    delete data.email;

    const obs = this.editing()
      ? this.svc.update(this.editing().id, data)
      : this.svc.create(data);

    obs.subscribe({
      next: () => { this.showModal.set(false); this.load(); this.saving.set(false); },
      error: (e: any) => {
        this.errors.set(e.error?.errors ?? [e.error?.message ?? 'Erreur']);
        this.step.set(1);
        this.saving.set(false);
      },
    });
  }

  remove(u: any) {
    this.askConfirm('Supprimer l\'utilisateur', `"${u.first_name} ${u.last_name}" sera supprimé définitivement.`, () => {
      this.svc.remove(u.id).subscribe({ next: () => this.load() });
    });
  }

  initials(): string {
    const f = this.form.first_name?.[0] ?? '';
    const l = this.form.last_name?.[0] ?? '';
    return (f + l).toUpperCase() || '?';
  }

  roleLabel(r: string): string {
    const l: Record<string, string> = {
      manager: 'Manager', caissier: 'Caissier', magasinier: 'Magasinier',
      auditeur: 'Auditeur', livreur: 'Livreur',
    };
    return l[r] ?? r;
  }

  siteNames(u: any): string {
    const s = u.sites ?? [];
    return s.length ? s.map((x: any) => x.name).join(', ') : '—';
  }
}
