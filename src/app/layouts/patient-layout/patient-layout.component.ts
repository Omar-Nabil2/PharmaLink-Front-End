import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './patient-layout.component.html',
  styleUrl: './patient-layout.component.scss',
})
export class PatientLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  patientNavItems = [
    { label: 'الرئيسية', routerLink: '/patient/dashboard' },
    { label: 'الأدوية', routerLink: '/patient/drugs' },
    { label: 'روشتاتي', routerLink: '/patient/prescriptions' },
    { label: 'استشارة صيدلي', routerLink: '/patient/medical-inquiries' },
    { label: 'طلباتي', routerLink: '/patient/orders' },
    { label: 'صيدليات قريبة', routerLink: '/patient/pharmacies/nearby' },
  ];

  menuOpen = false;
  readonly userMenuOpen = signal(false);
  readonly fullNameSignal = computed(() => this.authService.currentUser()?.fullName || this.fullName);
  readonly avatarInitial = computed(() => this.fullNameSignal().charAt(0).toUpperCase() || 'م');

  get fullName(): string {
    if (typeof window === 'undefined') return 'حسابي';
    return localStorage.getItem('fullName') || 'حسابي';
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  closeMenus(): void {
    this.menuOpen = false;
    this.userMenuOpen.set(false);
  }

  logout(): void {
    this.closeMenus();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
