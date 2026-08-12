import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeArEg from '@angular/common/locales/ar-EG';

registerLocaleData(localeArEg);
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { PharmaLinkPreset } from '@core/config/primeng-theme';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'ar-EG' },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
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
