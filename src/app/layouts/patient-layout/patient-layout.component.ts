import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './patient-layout.component.html',
  styleUrl: './patient-layout.component.scss',
})
export class PatientLayoutComponent {
  patientNavItems = [
    { label: 'الرئيسية', routerLink: '/patient/dashboard' },
    { label: 'الأدوية', routerLink: '/patient/drugs' },
    { label: 'المساعد الذكي', routerLink: '/patient/ai-assistant' },
    { label: 'روشتاتي', routerLink: '/patient/prescriptions' },
    { label: 'استشارة صيدلي', routerLink: '/patient/medical-inquiries' },
    { label: 'طلباتي', routerLink: '/patient/orders' },
    { label: 'صيدليات قريبة', routerLink: '/patient/pharmacies/nearby' },
  ];

  menuOpen = false;

  get fullName(): string {
    if (typeof window === 'undefined') return 'حسابي';
    return localStorage.getItem('fullName') || 'حسابي';
  }
}
