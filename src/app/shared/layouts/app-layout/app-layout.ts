import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const ALL_NAV: { label: string; path: string; icon: string; roles: string[] }[] = [
  { label: 'Dashboard',    path: '/app/dashboard',    icon: '⊟', roles: ['tenant_admin','manager','magasinier','caissier','auditeur'] },
  { label: 'Ventes',             path: '/app/ventes',            icon: '🧾', roles: ['caissier'] },
  { label: 'Historique ventes', path: '/app/historique-ventes', icon: '🧾', roles: ['tenant_admin','manager'] },
  { label: 'Mes ventes',        path: '/app/mes-ventes',        icon: '📋', roles: ['caissier'] },
  { label: 'Sites',        path: '/app/sites',        icon: '⊞', roles: ['tenant_admin','manager'] },
  { label: 'Utilisateurs', path: '/app/utilisateurs', icon: '⊙', roles: ['tenant_admin','manager'] },
  { label: 'Produits',     path: '/app/produits',     icon: '▦', roles: ['tenant_admin','manager','magasinier','caissier','auditeur'] },
  { label: 'Catégories',   path: '/app/categories',   icon: '≡', roles: ['tenant_admin','manager'] },
  { label: 'Unités',       path: '/app/unites',       icon: '◻', roles: ['tenant_admin','manager'] },
  { label: 'Stock',        path: '/app/stock',        icon: '↕', roles: ['tenant_admin','manager','magasinier','caissier','auditeur'] },
  { label: 'Fournisseurs', path: '/app/fournisseurs', icon: '◎', roles: ['tenant_admin','manager','auditeur'] },
  { label: 'Commandes',    path: '/app/commandes',    icon: '▤', roles: ['tenant_admin','manager','magasinier','auditeur'] },
  { label: 'Alertes',      path: '/app/alertes',      icon: '◬', roles: ['tenant_admin','manager','auditeur'] },
  { label: 'Rapports',     path: '/app/rapports',     icon: '≋', roles: ['tenant_admin','manager','auditeur'] },
  { label: 'Entreprise',   path: '/app/entreprise',   icon: '◈', roles: ['tenant_admin'] },
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
