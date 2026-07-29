import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/connexion']);
    return false;
  }
  if (auth.isSuperAdmin()) return true;

  router.navigate(['/app/dashboard']);
  return false;
};
