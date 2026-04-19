// apps/www/src/app/shared/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TOKEN_KEY } from '@internal-system-nx/core';

export function roleGuard(requiredRole: string): CanActivateFn {
  return () => {
    const router = inject(Router);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.navigate(['/auth/login']);
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === requiredRole) return true;
    } catch {
      throw new Error()
    }
    router.navigate(['/dashboard/courses']);
    return false;
  };
}
