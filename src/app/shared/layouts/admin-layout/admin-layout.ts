import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const ADMIN_NAV = [
  { label: 'Dashboard',      path: '/admin/dashboard',      icon: '⊟' },
  { label: 'Organisations',  path: '/admin/organisations',  icon: '⊞' },
  { label: 'Agents',         path: '/admin/agents',         icon: '👥' },
  { label: 'Utilisateurs',   path: '/admin/utilisateurs',   icon: '👤' },
  { label: 'Permissions',    path: '/admin/permissions',    icon: '🔐' },
];

@Component({
  selector:    'app-admin-layout',
  standalone:  true,
  imports:     [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  readonly auth    = inject(AuthService);
  readonly user    = this.auth.user;
  readonly navItems = ADMIN_NAV;
}
