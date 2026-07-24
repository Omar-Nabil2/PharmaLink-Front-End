import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { AppRoles } from './core/enums/app-roles.constant';

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
        loadComponent: () =>
          import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./pages/profile/update-profile/update-profile.component').then(
            (m) => m.UpdateProfileComponent,
          ),
      },
      {
        path: 'prescriptions/review/:id',
        loadComponent: () => import('./pages/prescriptions/review-prescription/review-prescription.component').then(m => m.ReviewPrescriptionComponent)
      },
      {
        path: 'privacy',
        loadComponent: () => import('./pages/static/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
      },
      {
        path: 'terms',
        loadComponent: () => import('./pages/static/terms/terms.component').then(m => m.TermsComponent)
      },
      {
        path: 'faq',
        loadComponent: () => import('./pages/static/faq/faq.component').then(m => m.FaqComponent)
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
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
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
            (m) => m.ChangePasswordComponent,
          ),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./pages/errors/access-denied/access-denied.component').then(
            (m) => m.AccessDeniedComponent,
          ),
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },

    ],
  },
  {
    path: 'patient',
    canActivate: [authGuard],
    data: { role: AppRoles.Patient },
    loadComponent: () =>
      import('./layouts/patient-layout/patient-layout.component').then(
        (m) => m.PatientLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/patient-dashboard/patient-dashboard.component').then(
            (m) => m.PatientDashboardComponent,
          ),
      },
      {
        path: 'prescriptions/upload',
        loadComponent: () =>
          import('./pages/prescriptions/upload-prescription/upload-prescription.component').then(
            (m) => m.UploadPrescriptionComponent,
          ),
      },
      {
        path: 'addresses',
        loadComponent: () =>
          import('./pages/profile/addresses/address-list/address-list.component').then((m) => m.AddressListComponent),
      },
      {
        path: 'addresses/new',
        loadComponent: () =>
          import('./pages/profile/addresses/address-form/address-form.component').then((m) => m.AddressFormComponent),
      },
      {
        path: 'addresses/edit/:id',
        loadComponent: () =>
          import('./pages/profile/addresses/address-form/address-form.component').then((m) => m.AddressFormComponent),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        data: { role: AppRoles.Patient },
        loadComponent: () =>
          import('./pages/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        data: { role: AppRoles.Patient },
        loadComponent: () =>
          import('./pages/checkout/checkout').then((m) => m.CheckoutComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'pharmacist',
    canActivate: [authGuard],
    data: { role: AppRoles.Pharmacist },
    loadComponent: () =>
      import('./layouts/pharmacist-layout/pharmacist-layout.component').then(
        (m) => m.pharmacistLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/pharmacist-dashboard/pharmacist-dashboard.component').then(
            (m) => m.pharmacistDashboardComponent,
          ),
      },
      {
        path: 'assigned-orders',
        loadComponent: () =>
          import('./pages/pharmacist/assigned-orders/assigned-orders').then(
            (m) => m.AssignedOrders,
          ),
      },
      {
        path: 'assigned-orders/:id',
        loadComponent: () =>
          import('./pages/pharmacist/order-details/order-details.component').then(
            (m) => m.OrderDetailsComponent,
          ),
      },
      {
        path: 'preparation-list',
        loadComponent: () => import('./pages/pharmacist/preparation-list/preparation-list').then((m) => m.PreparationListComponent),
      },
      {
        path: 'inventory',
        loadComponent: () => import('./pages/pharmacist/inventory/inventory.component').then(m => m.InventoryComponent)
      },
      {
        path: 'prescription-queue',
        loadComponent: () =>
          import('./pages/pharmacist/prescription-queue/prescription-queue').then(
            (m) => m.PrescriptionQueue,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    ],
  },
  {
    path: 'owner',
    canActivate: [authGuard],
    data: { role: AppRoles.PharmacyAdmin },
    loadComponent: () =>
      import('./layouts/owner-layout/owner-layout.component').then((m) => m.OwnerLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/owner-dashboard/pharmacy-dashboard.component').then(
            (m) => m.PharmacyDashboardComponent,
          ),
      },
      {
        path: 'dashboard/:id',
        loadComponent: () =>
          import('./pages/dashboard/owner-dashboard/pharmacy-dashboard.component').then(
            (m) => m.PharmacyDashboardComponent,
          ),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./pages/inventory/inventory.component').then((m) => m.InventoryComponent),
      },
      {
        path: 'pharmacy-profile',
        loadComponent: () =>
          import('./pages/pharmacy-profile/pharmacy-profile.component').then((m) => m.PharmacyProfileComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: AppRoles.Admin },

    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'pharmacies',
        loadComponent: () =>
          import('./pages/admin/pharmacies/admin-pharmacies.component').then(
            (m) => m.AdminPharmaciesComponent,
          ),
      },
      {
        path: 'pharmacies/:id',
        loadComponent: () =>
          import('./pages/admin/pharmacies/pharmacy-detail/pharmacy-detail.component').then(
            (m) => m.PharmacyDetailComponent,
          ),
      },
      {
        path: 'pharmacy-owners',
        loadComponent: () =>
          import('./pages/admin/pharmacy-owners/admin-pharmacy-owners.component').then(
            (m) => m.AdminPharmacyOwnersComponent,
          ),
      },
      {
        path: 'owners',
        redirectTo: 'pharmacy-owners',
        pathMatch: 'full',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders/admin-orders/admin-orders.component').then(
            (m) => m.AdminOrdersComponent,
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/orders/admin-order-detail/admin-order-detail.component').then(
            (m) => m.AdminOrderDetailComponent,
          ),
      },
      {
        path: 'drugs',
        loadComponent: () =>
          import('./pages/admin/drugs/admin-drugs.component').then(
            (m) => m.AdminDrugsComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  // Unknown routes → Not Found (keeps main layout: navbar + footer)
  {
    path: 'cart',
    redirectTo: '/patient/cart',
    pathMatch: 'full'
  },
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