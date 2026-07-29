import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminRolesService } from '../../../core/services/admin-roles.service';

const MODULES = [
  'produits', 'categories', 'unites', 'stock', 'fournisseurs',
  'commandes', 'alertes', 'rapports', 'ventes', 'utilisateurs', 'sites', 'entreprise',
];
const ACTIONS = ['read', 'create', 'update', 'delete'];
const ACTION_LABELS: Record<string, string> = { read: 'Lire', create: 'Créer', update: 'Modifier', delete: 'Supprimer' };
const MODULE_LABELS: Record<string, string> = {
  produits: 'Produits', categories: 'Catégories', unites: 'Unités', stock: 'Stock',
  fournisseurs: 'Fournisseurs', commandes: 'Commandes', alertes: 'Alertes',
  rapports: 'Rapports', ventes: 'Ventes', utilisateurs: 'Utilisateurs',
  sites: 'Sites', entreprise: 'Entreprise',
};

@Component({
  selector: 'app-admin-permissions',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-permissions.html',
})
export class AdminPermissionsComponent implements OnInit {
  private readonly svc = inject(AdminRolesService);

  readonly modules      = MODULES;
  readonly actions      = ACTIONS;
  readonly actionLabels = ACTION_LABELS;
  readonly moduleLabels = MODULE_LABELS;

  readonly rolesAll    = signal<any[]>([]);
  readonly permissions = signal<any[]>([]);
  readonly activeTab   = signal<'nexalab' | 'tenant'>('tenant');
  readonly selectedRole = signal<any>(null);
  readonly checkedIds  = signal<Set<string>>(new Set());
  readonly loading     = signal(false);
  readonly saving      = signal(false);
  readonly saveOk      = signal(false);

  // Création de rôle
  showCreateModal = signal(false);
  createError     = signal('');
  createForm      = { type: 'tenant' as 'nexalab' | 'tenant', name: '', label: '', description: '' };

  readonly filteredRoles = computed(() =>
    this.rolesAll().filter(r => r.type === this.activeTab())
  );

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading.set(true);
    this.svc.getRoles().subscribe({
      next: (r) => {
        this.rolesAll.set(r.data);
        this.svc.getPermissions().subscribe({
          next: (p) => { this.permissions.set(p.data); this.loading.set(false); },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  setTab(tab: 'nexalab' | 'tenant') {
    this.activeTab.set(tab);
    this.selectedRole.set(null);
    this.checkedIds.set(new Set());
  }

  selectRole(role: any) {
    this.selectedRole.set(role);
    this.saveOk.set(false);
    this.svc.getRolePermissions(role.id).subscribe({
      next: (r) => {
        this.checkedIds.set(new Set(r.data.map((p: any) => p.id)));
      },
    });
  }

  permId(module: string, action: string): string {
    return this.permissions().find(p => p.module === module && p.action === action)?.id ?? '';
  }

  isChecked(module: string, action: string): boolean {
    const id = this.permId(module, action);
    return id ? this.checkedIds().has(id) : false;
  }

  toggle(module: string, action: string) {
    const id = this.permId(module, action);
    if (!id) return;
    const next = new Set(this.checkedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.checkedIds.set(next);
  }

  toggleAll(module: string) {
    const next = new Set(this.checkedIds());
    const ids  = ACTIONS.map(a => this.permId(module, a)).filter(Boolean);
    const allOn = ids.every(id => next.has(id));
    ids.forEach(id => allOn ? next.delete(id) : next.add(id));
    this.checkedIds.set(next);
  }

  allModuleChecked(module: string): boolean {
    return ACTIONS.every(a => this.isChecked(module, a));
  }

  save() {
    const role = this.selectedRole();
    if (!role) return;
    this.saving.set(true);
    this.saveOk.set(false);
    this.svc.setRolePermissions(role.id, [...this.checkedIds()]).subscribe({
      next: () => { this.saving.set(false); this.saveOk.set(true); },
      error: () => this.saving.set(false),
    });
  }

  openCreate() {
    this.createForm = { type: this.activeTab(), name: '', label: '', description: '' };
    this.createError.set('');
    this.showCreateModal.set(true);
  }

  submitCreate(f: NgForm) {
    if (f.invalid) return;
    this.saving.set(true);
    this.svc.createRole(this.createForm).subscribe({
      next: () => { this.saving.set(false); this.showCreateModal.set(false); this.loadAll(); },
      error: (err) => { this.createError.set(err.error?.message ?? 'Erreur'); this.saving.set(false); },
    });
  }

  deleteRole(role: any) {
    if (role.is_system) return;
    if (!confirm(`Supprimer le rôle "${role.label}" ?`)) return;
    this.svc.deleteRole(role.id).subscribe({
      next: () => {
        if (this.selectedRole()?.id === role.id) { this.selectedRole.set(null); this.checkedIds.set(new Set()); }
        this.loadAll();
      },
    });
  }
}
