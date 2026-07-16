import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  // FIX: Change currentUserRole() to userRole() to match the new Signal
  const currentRole = authService.userRole();
  const expectedRole = route.data['role'] as string | undefined;

  // If unauthenticated
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

  // If no specific role is expected, just being authenticated is enough
  if (!expectedRole) {
    return true;
  }

  // Normalize expected role
  let normalizedExpectedRole = expectedRole.toLowerCase().replace(/\s+/g, '');
  if (normalizedExpectedRole === 'systemadmin' || normalizedExpectedRole === 'administrator') {
    normalizedExpectedRole = 'admin';
  }

  // If the user's role matches the expected role
  if (authService.getNormalizedRole() === normalizedExpectedRole) {
    return true;
  }

  // Authenticated but lacks the correct role: redirect to their specific dashboard
  messageService.add({
    severity: 'error',
    summary: 'Access Denied',
    detail: 'You do not have permission to access this page.',
  });

  const redirectPath = `/${authService.getNormalizedRole()}/dashboard`;
  return router.createUrlTree([redirectPath]);
};
