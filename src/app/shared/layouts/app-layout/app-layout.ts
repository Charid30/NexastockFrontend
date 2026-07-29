import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const ALL_NAV: { label: string; path: string; icon: string; roles: string[] }[] = [
  { label: 'Dashboard',          path: '/app/dashboard',          icon: 'dashboard',    roles: ['tenant_admin','manager','magasinier','caissier','auditeur'] },
  { label: 'Ventes',             path: '/app/ventes',             icon: 'ventes',       roles: ['caissier'] },
  { label: 'Historique ventes',  path: '/app/historique-ventes',  icon: 'historique',   roles: ['tenant_admin','manager'] },
  { label: 'Mes ventes',         path: '/app/mes-ventes',         icon: 'mes-ventes',   roles: ['caissier'] },
  { label: 'Sites',              path: '/app/sites',              icon: 'sites',        roles: ['tenant_admin','manager'] },
  { label: 'Utilisateurs',       path: '/app/utilisateurs',       icon: 'utilisateurs', roles: ['tenant_admin','manager'] },
  { label: 'Produits',           path: '/app/produits',           icon: 'produits',     roles: ['tenant_admin','manager','magasinier','caissier','auditeur'] },
  { label: 'Catégories',         path: '/app/categories',         icon: 'categories',   roles: ['tenant_admin','manager'] },
  { label: 'Unités',             path: '/app/unites',             icon: 'unites',       roles: ['tenant_admin','manager'] },
  { label: 'Stock',              path: '/app/stock',              icon: 'stock',        roles: ['tenant_admin','manager','magasinier','caissier','auditeur'] },
  { label: 'Fournisseurs',       path: '/app/fournisseurs',       icon: 'fournisseurs', roles: ['tenant_admin','manager','auditeur'] },
  { label: 'Commandes',          path: '/app/commandes',          icon: 'commandes',    roles: ['tenant_admin','manager','magasinier','auditeur'] },
  { label: 'Alertes',            path: '/app/alertes',            icon: 'alertes',      roles: ['tenant_admin','manager','auditeur'] },
  { label: 'Rapports',           path: '/app/rapports',           icon: 'rapports',     roles: ['tenant_admin','manager','auditeur'] },
  { label: 'Entreprise',         path: '/app/entreprise',         icon: 'entreprise',   roles: ['tenant_admin'] },
];

@Component({
  selector:    'app-app-layout',
  standalone:  true,
  imports:     [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.html',
})
export class AppLayout {
  readonly auth = inject(AuthService);
  readonly user = this.auth.user;

  readonly navItems = computed(() => {
    const role = this.auth.user()?.role ?? '';
    return ALL_NAV.filter(item => item.roles.includes(role));
  });
}
