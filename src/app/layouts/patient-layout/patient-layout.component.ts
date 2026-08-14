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
          
          // Set app badge to 1 to notify the user visually on the home screen icon
          if ('setAppBadge' in navigator) {
            (navigator as any).setAppBadge(1).catch(console.error);
          }

          Swal.fire({
            title: '<strong style="color: #0d9488;">وقت الدواء! 💊</strong>',
            html: `
              <div dir="rtl" style="text-align: right; background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 16px; margin-top: 10px;">
                <p style="margin: 0 0 8px 0; font-size: 1.1rem; color: #0f172a;">الدواء: <strong style="color: #0d9488; font-size: 1.2rem;">${data.medicineName}</strong></p>
                ${data.dosage ? `<p style="margin: 0 0 8px 0; color: #334155; font-size: 1rem;">الجرعة: <strong>${data.dosage}</strong></p>` : ''}
                ${data.notes ? `<p style="margin: 0; color: #64748b; font-size: 0.9rem;">📝 ${data.notes}</p>` : ''}
              </div>
              <p style="margin-top: 16px; font-size: 0.9rem; color: #64748b; text-align: center;">مع تمنياتنا لك بالشفاء العاجل 🌿</p>
            `,
            icon: 'info',
            iconColor: '#0d9488',
            confirmButtonText: 'حسناً، تم',
            confirmButtonColor: '#0d9488',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl font-bold px-6'
            }
          }).then(() => {
            // Clear the app badge once the user acknowledges the reminder
            if ('clearAppBadge' in navigator) {
              (navigator as any).clearAppBadge().catch(console.error);
            }
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
