import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  adminNavItems: SidebarItem[] = [
    { label: 'لوحة التحكم', icon: 'pi pi-th-large', routerLink: '/admin/dashboard' },
    { label: 'كتالوج الأدوية', icon: 'pi pi-link', routerLink: '/admin/drugs' },
    { label: 'الصيدليات', icon: 'pi pi-building', routerLink: '/admin/pharmacies' },
    { label: 'جميع الطلبات', icon: 'pi pi-list', routerLink: '/admin/orders' },
    { label: 'إدارة المستخدمين', icon: 'pi pi-users', routerLink: '/admin/users' },
    { label: 'موافقات الصيدليات', icon: 'pi pi-verified', routerLink: '/admin/approvals' },
  ];
}
