import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { clearAuthSession } from '@core/utils/auth-storage';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@environments/environment';
import { ProfileService } from '@core/services/profile.service';
import { AppRoles } from '@core/enums/app-roles.constant';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  menuOpen = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly profileService: ProfileService
  ) { }

  ngOnInit() {
    if (this.isLoggedIn && !localStorage.getItem('profilePictureUrl')) {
      if (this.authService.getNormalizedRole() === AppRoles.Patient) {
        this.profileService.getPatientProfilePictureUrl().subscribe({
          next: (res) => {
            if (res.url) {
              localStorage.setItem('profilePictureUrl', res.url);
            }
          },
          error: () => { }
        });
      }
    }
  }

  @HostListener('window:storage')
  onStorageChange(): void { }

  get isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  }

  get fullName(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('fullName') || 'Profile';
  }

  get profilePictureUrl(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('profilePictureUrl');
  }

  get dashboardPath(): string {
    return this.authService.getDashboardPath();
  }

  get profilePath(): string {
    const role = this.authService.getNormalizedRole();
    switch (role) {
      case AppRoles.DeliveryDriver:
        return '/driver/profile';
      case AppRoles.Admin:
        return '/admin/profile';
      case AppRoles.Pharmacist:
        return '/pharmacist/profile';
      default:
        return '/profile';
    }
  }
  getProfileLink(): string {
    const roleStr = typeof window !== 'undefined' ? localStorage.getItem('roleName')?.toLowerCase() : '';
    if (roleStr === 'patient') return '/patient/profile';
    if (roleStr === 'pharmacist') return '/pharmacist/profile';
    if (roleStr === 'admin' || roleStr === 'systemadmin') return '/admin/profile';
    if (roleStr === 'pharmacyadmin') return '/owner/profile';
    if (roleStr === 'prescriptionreviewteam') return '/review-team/profile';
    if (roleStr === 'supplier') return '/supplier/profile';
    if (roleStr === 'deliverydriver') return '/driver/profile';
    return '/profile';
  }

  getChangePasswordLink(): string {
    const roleStr = typeof window !== 'undefined' ? localStorage.getItem('roleName')?.toLowerCase() : '';
    if (roleStr === 'patient') return '/patient/change-password';
    if (roleStr === 'pharmacist') return '/pharmacist/change-password';
    if (roleStr === 'admin' || roleStr === 'systemadmin') return '/admin/change-password';
    if (roleStr === 'pharmacyadmin') return '/owner/change-password';
    if (roleStr === 'prescriptionreviewteam') return '/review-team/change-password';
    if (roleStr === 'supplier') return '/supplier/change-password';
    if (roleStr === 'deliverydriver') return '/driver/change-password';
    return '/change-password';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
