import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { AppRoles } from './core/enums/app-roles.constant';
import { DriverHistoryComponent } from '@pages/driver-history/driver-history.component';

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
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'drugs',
        loadComponent: () => import('./pages/drugs/drugs').then((m) => m.DrugsComponent),
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
        path: 'privacy',
        loadComponent: () =>
          import('./pages/static/privacy-policy/privacy-policy.component').then(
            (m) => m.PrivacyPolicyComponent,
          ),
      },
      {
        path: 'terms',
        loadComponent: () =>
          import('./pages/static/terms/terms.component').then((m) => m.TermsComponent),
      },
      {
        path: 'faq',
        loadComponent: () => import('./pages/static/faq/faq.component').then((m) => m.FaqComponent),
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

  // 2️⃣ صفحات تسجيل الدخول والإنشاء (Auth Routes)
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

  // 3️⃣ لوحة المريض (Patient Portal)
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
        path: 'drugs',
        loadComponent: () => import('./pages/drugs/drugs').then((m) => m.DrugsComponent),
      },
      {
        path: 'drugs/:id',
        loadComponent: () =>
          import('./pages/drugs/drug-details/drug-details.component').then(
            (m) => m.DrugDetailsComponent,
          ),
      },
      {
        path: 'ai-assistant',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/ai-assistant/ai-assistant.component').then((m) => m.AiAssistantComponent),
      },
      {
        path: 'prescriptions/upload',
        loadComponent: () =>
          import('./pages/prescriptions/upload-prescription/upload-prescription.component').then(
            (m) => m.UploadPrescriptionComponent,
          ),
      },
      {
        path: 'prescriptions',
        loadComponent: () =>
          import('./pages/patient-prescription-review.component/patient-prescription-review.component').then(
            (m) => m.PatientPrescriptionsListComponent,
          ),
      },
      {
        path: 'medical-inquiries',
        loadComponent: () =>
          import('./pages/patient-medical-inquiries/patient-medical-inquiries.component').then(
            (m) => m.PatientMedicalInquiriesComponent,
          ),
      },
      {
        path: 'prescriptions/review/:id',
        loadComponent: () =>
          import('./pages/prescription-detail.component/prescription-detail.component').then(
            (m) => m.PatientPrescriptionDetailComponent,
          ),
      },
      {
        path: 'image-search',
        loadComponent: () =>
          import('./pages/medicine-image-scan/medicine-image-scan.component').then(
            (m) => m.MedicineImageScanComponent,
          ),
      },
      {
        path: 'addresses',
        loadComponent: () =>
          import('./pages/profile/addresses/address-list/address-list.component').then(
            (m) => m.AddressListComponent,
          ),
      },
      {
        path: 'addresses/new',
        loadComponent: () =>
          import('./pages/profile/addresses/address-form/address-form.component').then(
            (m) => m.AddressFormComponent,
          ),
      },
      {
        path: 'addresses/edit/:id',
        loadComponent: () =>
          import('./pages/profile/addresses/address-form/address-form.component').then(
            (m) => m.AddressFormComponent,
          ),
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout').then((m) => m.CheckoutComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders/patient-orders/patient-orders.component').then(
            (m) => m.PatientOrdersComponent,
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/orders/patient-order-detail/patient-order-detail.component').then(
            (m) => m.PatientOrderDetailComponent,
          ),
      },
      {
        path: 'pharmacies/nearby',
        loadComponent: () =>
          import('./pages/pharmacies/nearby-pharmacies/nearby-pharmacies.component').then(
            (m) => m.NearbyPharmaciesComponent,
          ),
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
        path: 'change-password',
        loadComponent: () =>
          import('./pages/auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./pages/errors/access-denied/access-denied.component').then(
            (m) => m.AccessDeniedComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },

  // 4️⃣ لوحة الصيدلي (Pharmacist Portal)
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
        path: 'prescriptions/review/:id',
        loadComponent: () =>
          import('./pages/prescriptions/review-prescription/review-prescription.component').then(
            (m) => m.ReviewPrescriptionComponent,
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
        loadComponent: () =>
          import('./pages/pharmacist/preparation-list/preparation-list').then(
            (m) => m.PreparationListComponent,
          ),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./pages/pharmacist/inventory/inventory.component').then(
            (m) => m.InventoryComponent,
          ),
      },
      {
        path: 'prescription-queue',
        loadComponent: () =>
          import('./pages/pharmacist/prescription-queue/prescription-queue').then(
            (m) => m.PrescriptionQueue,
          ),
      },
      {
        path: 'prescription-analytics',
        loadComponent: () =>
          import('./pages/pharmacist/prescription-analytics/prescription-analytics.component').then(
            (m) => m.PrescriptionAnalyticsComponent,
          ),
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
        path: 'change-password',
        loadComponent: () =>
          import('./pages/auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./pages/errors/access-denied/access-denied.component').then(
            (m) => m.AccessDeniedComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },

  {
    path: 'review-team',
    canActivate: [authGuard],
    data: { role: AppRoles.PrescriptionReviewTeam },
    loadComponent: () =>
      import('./layouts/review-team-layout/review-team-layout.component').then(
        (m) => m.ReviewTeamLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/review-team/review-team-dashboard.component').then(
            (m) => m.ReviewTeamDashboardComponent,
          ),
      },
      {
        path: 'prescriptions',
        loadComponent: () =>
          import('./pages/pharmacist/prescription-queue/prescription-queue').then(
            (m) => m.PrescriptionQueue,
          ),
      },
      {
        path: 'prescriptions/review/:id',
        loadComponent: () =>
          import('./pages/prescriptions/review-prescription/review-prescription.component').then(
            (m) => m.ReviewPrescriptionComponent,
          ),
      },
      {
        path: 'medical-inquiries',
        loadComponent: () =>
          import('./pages/review-team/medical-inquiries.component').then(
            (m) => m.MedicalInquiriesComponent,
          ),
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
        path: 'change-password',
        loadComponent: () =>
          import('./pages/auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./pages/errors/access-denied/access-denied.component').then(
            (m) => m.AccessDeniedComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },

  {
    path: 'supplier',
    canActivate: [authGuard],
    data: { role: AppRoles.Supplier },
    loadComponent: () =>
      import('./layouts/supplier-layout/supplier-layout.component').then(
        (m) => m.SupplierLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/supplier-dashboard/supplier-dashboard.component').then(
            (m) => m.SupplierDashboardComponent,
          ),
      },
      {
        path: 'drugs',
        loadComponent: () =>
          import('./pages/supplier-drug/supplier-drugs.component').then(
            (m) => m.SupplierDrugsComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/supplier-profile/supplier-profile.component').then(
            (m) => m.SupplierProfileComponent,
          ),
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./pages/profile/update-profile/update-profile.component').then(
            (m) => m.UpdateProfileComponent,
          ),
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./pages/auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./pages/errors/access-denied/access-denied.component').then(
            (m) => m.AccessDeniedComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
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
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders/pharmacy-orders/pharmacy-orders.component').then(
            (m) => m.PharmacyOrdersComponent,
          ),
      },
      {
        path: 'supplier-orders',
        loadComponent: () =>
          import('./pages/orders/pharmacy-supplier-orders/pharmacy-orders.component').then(
            (m) => m.PharmacyOrdersComponent,
          ),
      },
      {
        path: 'pharmacy-profile',
        loadComponent: () =>
          import('./pages/pharmacy-profile/pharmacy-profile.component').then(
            (m) => m.PharmacyProfileComponent,
          ),
      },
      {
        path: 'branches',
        loadComponent: () =>
          import('./pages/branches/pharmacy-branch.component').then(
            (m) => m.PharmacyBranchComponent,
          ),
      },
      {
        path: 'pharmacists/:id',
        loadComponent: () =>
          import('./pages/pharmacy-admin/pharmacists/pharmacist-detail/pharmacist-detail.component').then(
            (m) => m.PharmacistDetailComponent,
          ),
      },
      {
        path: 'ai-forecasting',
        loadComponent: () =>
          import('./pages/ai-forecasting/ai-forecasting.component').then(
            (m) => m.AiForecastingComponent,
          ),
      },
      {
        path: 'pharmacists',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/pharmacy-admin/pharmacists/pharmacists-list/pharmacists-list.component').then(
            (m) => m.PharmacistsListComponent,
          ),
      },
      {
        path: 'prescription-analytics',
        loadComponent: () =>
          import('./pages/pharmacist/prescription-analytics/prescription-analytics.component').then(
            (m) => m.PrescriptionAnalyticsComponent,
          ),
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
        path: 'change-password',
        loadComponent: () =>
          import('./pages/auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./pages/errors/access-denied/access-denied.component').then(
            (m) => m.AccessDeniedComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },

  {
    path: 'driver',
    canActivate: [authGuard],
    data: { role: AppRoles.DeliveryDriver }, // تأكد إنك ضايف DeliveryDriver في AppRoles
    loadComponent: () =>
      import('./layouts/driver-layout/driver-layout.component').then(
        (m) => m.DriverLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/driver-dashboard/driver-dashboard.component').then(
            (m) => m.DriverDashboardComponent,
          ),
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
        path: 'history',
        component: DriverHistoryComponent,
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./pages/errors/access-denied/access-denied.component').then(
            (m) => m.AccessDeniedComponent,
          ),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
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
          import('./pages/admin/drugs/admin-drugs.component').then((m) => m.AdminDrugsComponent),
      },

      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
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
        path: 'change-password',
        loadComponent: () =>
          import('./pages/auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./pages/errors/access-denied/access-denied.component').then(
            (m) => m.AccessDeniedComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },

  {
    path: 'cart',
    redirectTo: '/patient/cart',
    pathMatch: 'full',
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
