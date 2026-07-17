import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'profile/edit',
        loadComponent: () => import('./pages/profile/update-profile/update-profile.component').then((m) => m.UpdateProfileComponent),
      }
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'verify-otp',
        loadComponent: () =>
          import('./pages/auth/verify-otp/verify-otp.component').then((m) => m.VerifyOtpComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./pages/services/services.component').then((m) => m.ServicesComponent),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/contact/contact.component').then((m) => m.ContactComponent),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'change-password',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent
          ),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./pages/errors/access-denied/access-denied.component').then(
            (m) => m.AccessDeniedComponent
          ),
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
  // Unknown routes → Not Found (keeps main layout: navbar + footer)
  {
    path: '**',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
