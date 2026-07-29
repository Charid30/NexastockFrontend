import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/layouts/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      { path: '', loadComponent: () => import('./features/public/landing/landing').then(m => m.LandingComponent) },
      { path: 'fonctionnalites', loadComponent: () => import('./features/public/fonctionnalites/fonctionnalites').then(m => m.FonctionnalitesComponent) },
      { path: 'tarifs',          loadComponent: () => import('./features/public/tarifs/tarifs').then(m => m.TarifsComponent) },
      { path: 'a-propos',        loadComponent: () => import('./features/public/a-propos/a-propos').then(m => m.AProposComponent) },
      { path: 'contact',         loadComponent: () => import('./features/public/contact/contact').then(m => m.ContactComponent) },
    ],
  },
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () => import('./shared/layouts/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      { path: 'connexion',   loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
      { path: 'inscription', loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent) },
    ],
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layouts/app-layout/app-layout').then(m => m.AppLayout),
    children: [
      { path: '',              redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    loadComponent: () => import('./features/app/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'sites',        loadComponent: () => import('./features/app/sites/sites').then(m => m.SitesComponent) },
      { path: 'utilisateurs', loadComponent: () => import('./features/app/users/users').then(m => m.UsersComponent) },
      { path: 'categories',   loadComponent: () => import('./features/app/categories/categories').then(m => m.CategoriesComponent) },
      { path: 'unites',       loadComponent: () => import('./features/app/units/units').then(m => m.UnitsComponent) },
      { path: 'produits',     loadComponent: () => import('./features/app/products/products').then(m => m.ProductsComponent) },
      { path: 'stock',        loadComponent: () => import('./features/app/stock/stock').then(m => m.StockComponent) },
      { path: 'fournisseurs', loadComponent: () => import('./features/app/suppliers/suppliers').then(m => m.SuppliersComponent) },
      { path: 'commandes',    loadComponent: () => import('./features/app/orders/orders').then(m => m.OrdersComponent) },
      { path: 'alertes',      loadComponent: () => import('./features/app/alerts/alerts').then(m => m.AlertsComponent) },
      { path: 'rapports',     loadComponent: () => import('./features/app/reports/reports').then(m => m.ReportsComponent) },
      { path: 'ventes',       loadComponent: () => import('./features/app/sales/sales').then(m => m.SalesComponent) },
      { path: 'mes-ventes',        loadComponent: () => import('./features/app/mes-ventes/mes-ventes').then(m => m.MesVentesComponent) },
      { path: 'historique-ventes', loadComponent: () => import('./features/app/historique-ventes/historique-ventes').then(m => m.HistoriqueVentesComponent) },
      { path: 'entreprise',   loadComponent: () => import('./features/app/company/company').then(m => m.CompanyComponent) },
    ],
  },
  {
    path: 'admin',
    canActivate: [superAdminGuard],
    loadComponent: () => import('./shared/layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '',               redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',      loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'organisations',  loadComponent: () => import('./features/admin/organisations/admin-organisations').then(m => m.AdminOrganisationsComponent) },
      { path: 'agents',         loadComponent: () => import('./features/admin/agents/admin-agents').then(m => m.AdminAgentsComponent) },
      { path: 'utilisateurs',   loadComponent: () => import('./features/admin/utilisateurs/admin-utilisateurs').then(m => m.AdminUtilisateursComponent) },
      { path: 'permissions',    loadComponent: () => import('./features/admin/permissions/admin-permissions').then(m => m.AdminPermissionsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
