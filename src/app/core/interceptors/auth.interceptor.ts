import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, BehaviorSubject, switchMap, filter, take } from 'rxjs';
import { clearAuthSession, getAccessToken, getRefreshToken, isAuthApiRequest } from '../utils/auth-storage';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Global HTTP interceptor:
 * - Attaches Bearer access token to outgoing requests
 * - Handles 401 → attempt token refresh, or clear session + redirect to login
 * - Handles 403 → redirect to Access Denied
 * - Handles 404 (GET, when appropriate) → redirect to Not Found
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
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

      if (error.status === 401 && !skipAuthApi) {
        return handle401Error(authReq, next, authService, router, currentUrl);
      }

      const roleStr = authService.userRole()?.toLowerCase() || '';
      let basePath = '';
      if (roleStr === 'patient') basePath = '/patient';
      else if (roleStr === 'pharmacist') basePath = '/pharmacist';
      else if (roleStr === 'admin' || roleStr === 'systemadmin') basePath = '/admin';
      else if (roleStr === 'pharmacyadmin') basePath = '/owner';
      else if (roleStr === 'prescriptionreviewteam') basePath = '/review-team';
      else if (roleStr === 'supplier') basePath = '/supplier';

      switch (error.status) {
        case 403: {
          const target = basePath ? `${basePath}/access-denied` : '/access-denied';
          if (currentUrl !== target) {
            router.navigate([target]);
          }
          break;
        }
        case 404: {
          // Only for resource GETs — form/API mutations keep component-level handling
          const isGet = authReq.method.toUpperCase() === 'GET';
          const target = basePath ? `${basePath}/not-found` : '/not-found';
          const alreadyOnNotFound = currentUrl === target || currentUrl === '/not-found';
          const isProfilePictureApi = authReq.url.includes('/profile/picture');
          if (isGet && !skipAuthApi && !alreadyOnNotFound && !isProfilePictureApi) {
            router.navigate([target]);
          }
          break;
        }
        case 500: {
          router.navigate(['/server-error']);
          break;
        }
        default:
          break;
      }

      return throwError(() => error);
    }),
  );
};

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, router: Router, currentUrl: string) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (accessToken && refreshToken) {
      return authService.refreshToken({ token: accessToken, refreshToken }).pipe(
        switchMap((response) => {
          isRefreshing = false;
          const newAccessToken = response.accessToken!;
          localStorage.setItem('accessToken', newAccessToken);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          refreshTokenSubject.next(newAccessToken);

          return next(request.clone({
            setHeaders: { Authorization: `Bearer ${newAccessToken}` }
          }));
        }),
        catchError((err) => {
          isRefreshing = false;
          clearAuthSession();
          if (!currentUrl.startsWith('/auth/login')) {
            router.navigate(['/auth/login'], {
              queryParams: { returnUrl: currentUrl === '/' ? null : currentUrl },
            });
          }
          return throwError(() => err);
        })
      );
    } else {
      isRefreshing = false;
      clearAuthSession();
      if (!currentUrl.startsWith('/auth/login')) {
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: currentUrl === '/' ? null : currentUrl },
        });
      }
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => {
        return next(request.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        }));
      })
    );
  }
}
