import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const ADMIN_NAV = [
  { label: 'Dashboard',      path: '/admin/dashboard',      icon: 'dashboard' },
  { label: 'Organisations',  path: '/admin/organisations',  icon: 'organisations' },
  { label: 'Agents',         path: '/admin/agents',         icon: 'agents' },
  { label: 'Utilisateurs',   path: '/admin/utilisateurs',   icon: 'utilisateurs' },
  { label: 'Permissions',    path: '/admin/permissions',    icon: 'permissions' },
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
