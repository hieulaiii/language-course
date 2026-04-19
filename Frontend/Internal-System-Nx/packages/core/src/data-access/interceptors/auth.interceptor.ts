// packages/core/src/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import {TOKEN_KEY} from "../../tokens";

/**
 * Attaches JWT from localStorage as `Authorization: Bearer <token>`
 * for every outgoing request that targets our API.
 *
 * Usage in app.config.ts:
 *   provideHttpClient(withInterceptors([authInterceptor]))
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const token = localStorage.getItem(TOKEN_KEY);

  // Only attach if we actually have a real JWT (not null/mock)
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};
