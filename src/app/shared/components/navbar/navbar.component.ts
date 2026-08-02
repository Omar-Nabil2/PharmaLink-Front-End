import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { clearAuthSession } from '@core/utils/auth-storage';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  menuOpen = false;

  constructor(private readonly router: Router, private readonly authService: AuthService) {}

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
    const url = localStorage.getItem('profilePictureUrl');
    return url ? environment.baseUrl.replace('/api/v1', '/') + url : null;
  }

  get dashboardPath(): string {
    return this.authService.getDashboardPath();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
