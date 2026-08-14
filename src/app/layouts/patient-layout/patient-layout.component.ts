import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ProfileService } from '@core/services/profile.service';
import { CartService } from '@core/services/cart.service';
import { environment } from '@environments/environment';
import { MedicineReminderSignalrService } from '@core/services/medicine-reminder-signalr.service';
import Swal from 'sweetalert2';

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
  private reminderSignalRService = inject(MedicineReminderSignalrService);

  cartCount$ = this.cartService.cartCount$;

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
  alarmMenuOpen = false;

  get fullName(): string {
    if (typeof window === 'undefined') return 'حسابي';
    return localStorage.getItem('fullName') || 'حسابي';
  }

  readonly profilePictureUrl = signal<string | null>(null);

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('') : '';
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.profilePictureUrl.set(localStorage.getItem('profilePictureUrl'));
    }

    if (this.authService.isLoggedIn()) {
      // Start SignalR Reminder Connection
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = localStorage.getItem('userId') || userData.userId;
      
      if (userId) {
        this.reminderSignalRService.connect(userId);
        this.reminderSignalRService.reminder$.subscribe(data => {
          Swal.fire({
            title: '💊 حان موعد الدواء!',
            html: `
              <div dir="rtl" style="font-size: 1.1rem; line-height: 1.8;">
                <p>اسم الدواء: <strong style="color: #2196f3;">${data.medicineName}</strong></p>
                ${data.dosage ? `<p>الجرعة: <strong>${data.dosage}</strong></p>` : ''}
                ${data.notes ? `<p>ملاحظات: ${data.notes}</p>` : ''}
                <p style="margin-top: 15px; font-size: 0.9rem; color: #666;">نتمنى لك دوام الصحة والعافية! 🌿</p>
              </div>
            `,
            icon: 'info',
            confirmButtonText: 'حسناً، تم',
            confirmButtonColor: '#3085d6'
          });
        });
      }

      // Initialize cart count
      this.cartService.getCart().subscribe({ error: () => {} });
      
      this.profileService.getPatientProfilePictureUrl().subscribe({
        next: (res) => {
            if (res.url) {
              let picUrl = res.url.replace(/\\/g, '/');
              if (!picUrl.startsWith('http')) {
                const serverUrl = environment.baseUrl.replace('/api/v1', '');
                const cleanServerUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
                const cleanPicUrl = picUrl.startsWith('/') ? picUrl : '/' + picUrl;
                picUrl = cleanServerUrl + cleanPicUrl;
              }
              localStorage.setItem('profilePictureUrl', picUrl);
              this.profilePictureUrl.set(picUrl);
            }
        },
        error: () => {}
      });
    }
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
    if (this.profileMenuOpen) this.alarmMenuOpen = false;
  }

  toggleAlarmMenu(): void {
    this.alarmMenuOpen = !this.alarmMenuOpen;
    if (this.alarmMenuOpen) this.profileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  isAiAssistantPage(): boolean {
    return this.router.url.includes('/patient/ai-assistant');
  }
}
