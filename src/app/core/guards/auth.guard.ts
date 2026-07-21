import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { AppRole } from '../enums/app-roles.constant';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  const currentRole = authService.userRole();
  const expectedRole = route.data['role'] as AppRole | undefined;

  // 1. If unauthenticated
  if (!currentRole) {
    messageService.add({
      severity: 'warn',
      summary: 'Sign in required',
      detail: 'Please sign in to continue.',
    });

    const currentUrl = state.url;
    return router.createUrlTree(['/auth/login'], {
      queryParams: currentUrl && currentUrl !== '/' ? { returnUrl: currentUrl } : undefined,
    });
  }

  // 2. If no specific role is expected, just being authenticated is enough
  if (!expectedRole) {
    return true;
  }

  // 3. Compare user's normalized role against expected role using AppRoles
  if (authService.hasRole(expectedRole)) {
    return true;
  }

  // 4. Authenticated but lacks the required role: redirect to user's dashboard
  messageService.add({
    severity: 'error',
    summary: 'Access Denied',
    detail: 'You do not have permission to access this page.',
  });

  const redirectPath = authService.getDashboardPath();
  return router.createUrlTree([redirectPath]);
};
