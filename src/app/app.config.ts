import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { PharmaLinkPreset } from '@core/config/primeng-theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    MessageService,
    providePrimeNG({
      theme: {
        preset: PharmaLinkPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: false,
          cssVariables: true,
        },
      },
      ripple: false,
      inputVariant: 'filled',
      overlayAppendTo: 'body',
    }),
  ],
};
