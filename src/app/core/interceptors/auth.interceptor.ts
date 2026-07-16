import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import {
  clearAuthSession,
  getAccessToken,
  isAuthApiRequest,
} from '../utils/auth-storage';

/**
 * Global HTTP interceptor:
 * - Attaches Bearer access token to outgoing requests
 * - Handles 401 → clear session + redirect to login
 * - Handles 403 → redirect to Access Denied
 * - Handles 404 (GET, when appropriate) → redirect to Not Found
 *
 * Refresh-token retry can be added later without changing call sites.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = getAccessToken();

  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const currentUrl = router.url.split('?')[0];
      const skipAuthApi = isAuthApiRequest(authReq.url);

      switch (error.status) {
        case 401: {
          if (!skipAuthApi) {
            clearAuthSession();
            if (!currentUrl.startsWith('/auth/login')) {
              router.navigate(['/auth/login'], {
                queryParams: { returnUrl: currentUrl === '/' ? null : currentUrl },
              });
            }
          }
          break;
        }
        case 403: {
          if (currentUrl !== '/access-denied') {
            router.navigate(['/access-denied']);
          }
          break;
        }
        case 404: {
          // Only for resource GETs — form/API mutations keep component-level handling
          const isGet = authReq.method.toUpperCase() === 'GET';
          const alreadyOnNotFound = currentUrl === '/not-found';
          if (isGet && !skipAuthApi && !alreadyOnNotFound) {
            router.navigate(['/not-found']);
          }
          break;
        }
        default:
          break;
      }

      return throwError(() => error);
    })
  );
};
