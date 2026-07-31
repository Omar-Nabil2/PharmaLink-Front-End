import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './patient-layout.component.html',
  styleUrl: './patient-layout.component.scss',
})
export class PatientLayoutComponent {
  patientNavItems: SidebarItem[] = [
    { label: 'الرئيسية', icon: 'pi pi-home', routerLink: '/patient/dashboard' },
    { label: 'كتالوج الأدوية', icon: 'pi pi-box', routerLink: '/drugs' },
    { label: 'سلة المشتريات', icon: 'pi pi-shopping-cart', routerLink: '/patient/cart' },
    { label: 'رفع روشتة', icon: 'pi pi-upload', routerLink: '/patient/prescriptions/upload' },
    { label: 'روشتاتي', icon: 'pi pi-file-check', routerLink: '/patient/prescriptions' },
    { label: 'رفع صورة دواء', icon: 'pi pi-image', routerLink: '/patient/image-search' },
    { label: 'طلباتي', icon: 'pi pi-list', routerLink: '/patient/orders' },
    { label: 'صيدليات قريبة', icon: 'pi pi-map-marker', routerLink: '/patient/pharmacies/nearby' },
    { label: 'عناويني', icon: 'pi pi-map-marker', routerLink: '/patient/addresses' },
    { label: 'الملف الشخصي', icon: 'pi pi-user', routerLink: '/profile' },
  ];
}
