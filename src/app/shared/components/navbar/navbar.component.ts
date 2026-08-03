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
  ) {}

  ngOnInit() {
    if (this.isLoggedIn && !localStorage.getItem('profilePictureUrl')) {
      if (this.authService.getNormalizedRole() === AppRoles.Patient) {
        this.profileService.getPatientProfilePictureUrl().subscribe({
          next: (res) => {
            if (res.url) {
              const fullUrl = environment.baseUrl.replace('/api/v1', '/') + res.url;
              localStorage.setItem('profilePictureUrl', fullUrl);
            }
          },
          error: () => {}
        });
      }
    }
  }

  @HostListener('window:storage')
  onStorageChange(): void {}

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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
