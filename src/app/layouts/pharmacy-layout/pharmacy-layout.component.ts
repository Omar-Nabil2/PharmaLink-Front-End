import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-pharmacy-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './pharmacy-layout.component.html',
  styleUrl: './pharmacy-layout.component.scss',
})
export class PharmacyLayoutComponent {
  pharmacyNavItems: SidebarItem[] = [
    { label: 'لوحة التحكم', icon: 'pi pi-home', routerLink: '/pharmacy/dashboard' },
    { label: 'المخزون', icon: 'pi pi-box', routerLink: '/pharmacy/inventory' },
    { label: 'تنفيذ الطلبات', icon: 'pi pi-check-square', routerLink: '/pharmacy/orders' },
    { label: 'إعدادات الفرع', icon: 'pi pi-cog', routerLink: '/pharmacy/settings' },
  ];
}
