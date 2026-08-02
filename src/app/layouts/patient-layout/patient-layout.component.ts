import { Component, inject } from '@angular/core';
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
  private authService = inject(AuthService);
  private router = inject(Router);

  patientNavItems = [
    { label: 'الرئيسية', routerLink: '/patient/dashboard' },
    { label: 'الأدوية', routerLink: '/patient/drugs' },

    { label: 'روشتاتي', routerLink: '/patient/prescriptions' },
    { label: 'استشارة صيدلي', routerLink: '/patient/medical-inquiries' },
    { label: 'طلباتي', routerLink: '/patient/orders' },
    { label: 'صيدليات قريبة', routerLink: '/patient/pharmacies/nearby' },
  ];

  menuOpen = false;
  profileMenuOpen = false;

  get fullName(): string {
    if (typeof window === 'undefined') return 'حسابي';
    return localStorage.getItem('fullName') || 'حسابي';
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
