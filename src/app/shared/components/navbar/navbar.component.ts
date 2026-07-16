import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  constructor(private readonly router: Router) {}

  // Listener to force Angular change detection to update when storage changes
  @HostListener('window:storage')
  onStorageChange(): void {
    // Handled by change detection cycle automatically
  }

  get isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  }

  get fullName(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('fullName') || 'Profile';
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('fullName');
      localStorage.removeItem('email');
      localStorage.removeItem('roleName');
    }
    
    // Dispatch storage event to notify other components/instances
    window.dispatchEvent(new Event('storage'));

    this.router.navigate(['/auth/login']);
  }
}
