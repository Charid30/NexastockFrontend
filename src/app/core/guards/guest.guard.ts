import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  auth.clearExpiredSession();

  if (auth.isLoggedIn()) {
    router.navigate([auth.dashboardUrl]);
    return false;
  }

  return true;
};
