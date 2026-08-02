import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';

const ALL_NAV: { label: string; path: string; icon: string; roles: string[]; perm: [string, string] | null }[] = [
  { label: 'Dashboard',          path: '/app/dashboard',          icon: 'dashboard',    roles: ['tenant_admin','manager','magasinier','caissier','auditeur'], perm: null },
  { label: 'Ventes',             path: '/app/ventes',             icon: 'ventes',       roles: ['caissier'],                                                   perm: ['ventes', 'create'] },
  { label: 'Historique ventes',  path: '/app/historique-ventes',  icon: 'historique',   roles: ['tenant_admin','manager'],                                     perm: ['ventes', 'read'] },
  { label: 'Mes ventes',         path: '/app/mes-ventes',         icon: 'mes-ventes',   roles: ['caissier'],                                                   perm: ['ventes', 'read'] },
  { label: 'Sites',              path: '/app/sites',              icon: 'sites',        roles: ['tenant_admin','manager'],                                     perm: ['sites', 'read'] },
  { label: 'Utilisateurs',       path: '/app/utilisateurs',       icon: 'utilisateurs', roles: ['tenant_admin','manager'],                                     perm: ['utilisateurs', 'read'] },
  { label: 'Produits',           path: '/app/produits',           icon: 'produits',     roles: ['tenant_admin','manager','magasinier','caissier','auditeur'],  perm: ['produits', 'read'] },
  { label: 'Catégories',         path: '/app/categories',         icon: 'categories',   roles: ['tenant_admin','manager'],                                     perm: ['categories', 'read'] },
  { label: 'Unités',             path: '/app/unites',             icon: 'unites',       roles: ['tenant_admin','manager'],                                     perm: ['unites', 'read'] },
  { label: 'Stock',              path: '/app/stock',              icon: 'stock',        roles: ['tenant_admin','manager','magasinier','caissier','auditeur'],  perm: ['stock', 'read'] },
  { label: 'Fournisseurs',       path: '/app/fournisseurs',       icon: 'fournisseurs', roles: ['tenant_admin','manager','auditeur'],                          perm: ['fournisseurs', 'read'] },
  { label: 'Commandes',          path: '/app/commandes',          icon: 'commandes',    roles: ['tenant_admin','manager','magasinier','auditeur'],             perm: ['commandes', 'read'] },
  { label: 'Alertes',            path: '/app/alertes',            icon: 'alertes',      roles: ['tenant_admin','manager','auditeur'],                          perm: ['alertes', 'read'] },
  { label: 'Rapports',           path: '/app/rapports',           icon: 'rapports',     roles: ['tenant_admin','manager','auditeur'],                          perm: ['rapports', 'read'] },
  { label: 'Entreprise',         path: '/app/entreprise',         icon: 'entreprise',   roles: ['tenant_admin'],                                               perm: ['entreprise', 'read'] },
];

@Component({
  selector:    'app-app-layout',
  standalone:  true,
  imports:     [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.html',
})
export class AppLayout {
  readonly auth = inject(AuthService);
  readonly perm = inject(PermissionService);
  readonly user = this.auth.user;

  readonly navItems = computed(() => {
    const role = this.auth.user()?.role ?? '';
    return ALL_NAV.filter(item =>
      item.roles.includes(role) &&
      (item.perm === null || this.perm.can(item.perm[0], item.perm[1]))
    );
  });

  readonly canSeeAlertes    = computed(() => this.navItems().some(i => i.path === '/app/alertes'));
  readonly canSeeEntreprise = computed(() => this.navItems().some(i => i.path === '/app/entreprise'));
}
