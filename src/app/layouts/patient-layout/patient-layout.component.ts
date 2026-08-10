import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ProfileService } from '@core/services/profile.service';
import { CartService } from '@core/services/cart.service';
import { environment } from '@environments/environment';

import { trigger, transition, style, query, animate } from '@angular/animations';
import { routeTransitionAnimations } from '../../shared/animations/route.animations';


@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './patient-layout.component.html',
  styleUrl: './patient-layout.component.scss',
  animations: [routeTransitionAnimations]
})
export class PatientLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  public cartService = inject(CartService);

  cartCount$ = this.cartService.cartCount$;

  patientNavItems = [
    { label: 'أرشيفي الذكي', routerLink: '/patient/prescription-history' },
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

  get profilePictureUrl(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('profilePictureUrl');
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('') : '';
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      // Initialize cart count
      this.cartService.getCart().subscribe({ error: () => {} });
      
      if (!localStorage.getItem('profilePictureUrl')) {
      this.profileService.getPatientProfilePictureUrl().subscribe({
        next: (res) => {
            if (res.url) {
              localStorage.setItem('profilePictureUrl', res.url);
            }
        },
        error: () => {}
      });
    }
  }
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  isAiAssistantPage(): boolean {
    return this.router.url.includes('/patient/ai-assistant');
  }
}
