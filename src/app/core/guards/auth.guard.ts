import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
    return true;
  }

  messageService.add({
    severity: 'warn',
    summary: 'Sign in required',
    detail: 'Please sign in to continue.',
  });

  const currentUrl = router.url;
  return router.createUrlTree(['/auth/login'], {
    queryParams: currentUrl && currentUrl !== '/' ? { returnUrl: currentUrl } : undefined,
  });
};
