import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
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
import { provideServiceWorker } from '@angular/service-worker';
import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { environment } from '@environments/environment';

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
    }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleClientId)
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
};
