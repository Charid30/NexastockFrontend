import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  auth.clearExpiredSession();

  if (auth.isLoggedIn()) return true;

  router.navigate(['/connexion']);
  return false;
};
