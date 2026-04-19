// apps/www/src/app/shared/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TOKEN_KEY } from '@internal-system-nx/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return true;
  return router.createUrlTree(['/auth/login']);
};
