import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 1. مسارات المصادقة (التسجيل والدخول)
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
        loadComponent: () => import('./pages/auth/verify-otp/verify-otp.component').then((m) => m.VerifyOtpComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },

  // 2. المسارات العامة والمسارات التي تتطلب تسجيل دخول ضمن التخطيط الرئيسي
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // المسارات العامة
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/services/services.component').then((m) => m.ServicesComponent),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
      },
      // المسارات المحمية (تحتاج تسجيل دخول)
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'profile/edit',
        canActivate: [authGuard], // تم إضافة الحماية هنا أيضاً
        loadComponent: () => import('./pages/profile/update-profile/update-profile.component').then((m) => m.UpdateProfileComponent),
      },
      {
        path: 'change-password',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/auth/change-password/change-password.component').then((m) => m.ChangePasswordComponent),
      },

      // مسارات الأخطاء المتعلقة بالتخطيط الرئيسي
      {
        path: 'access-denied',
        loadComponent: () => import('./pages/errors/access-denied/access-denied.component').then((m) => m.AccessDeniedComponent),
      },
      {
        path: 'not-found',
        loadComponent: () => import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },

  // 3. مسار لوحة تحكم المريض
  {
    path: 'patient',
    canActivate: [authGuard],
    data: { role: 'Patient' },
    loadComponent: () => import('./layouts/patient-layout/patient-layout.component').then(
      (m) => m.PatientLayoutComponent
    ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/patient-dashboard/patient-dashboard.component').then(
          (m) => m.PatientDashboardComponent
        ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart').then((m) => m.CartComponent),
      },
      {
        path: 'drugs',
        loadComponent: () =>
          import('./pages/drugs/drugs').then((m) => m.DrugsComponent),
      },
      {
        path: 'prescriptions/:id',
        loadComponent: () =>
          import('./pages/prescription-review/prescription-review').then(
            (m) => m.PrescriptionReviewComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },


  // 4. مسار لوحة تحكم الصيدلية
  {
    path: 'pharmacy',
    canActivate: [authGuard],
    data: { role: 'Pharmacy' },
    loadComponent: () => import('./layouts/pharmacy-layout/pharmacy-layout.component').then((m) => m.PharmacyLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/pharmacy-dashboard/pharmacy-dashboard.component').then((m) => m.PharmacyDashboardComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },

  // 5. مسار لوحة تحكم الإدارة
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },

  // 6. مسار غير معروف (يجب أن يكون دائماً في نهاية الملف)
  {
    path: '**',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];