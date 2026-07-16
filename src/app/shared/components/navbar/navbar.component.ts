import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { clearAuthSession } from '@core/utils/auth-storage';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  menuOpen = false;

  constructor(private readonly router: Router) {}

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

  logout(): void {
    clearAuthSession();
    this.router.navigate(['/auth/login']);
  }
}
