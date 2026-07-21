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
    { label: 'لوحة التحكم', icon: 'pi pi-home', routerLink: '/admin/dashboard' },
    { label: 'إدارة المستخدمين', icon: 'pi pi-users', routerLink: '/admin/users' },
    { label: 'موافقات الصيدليات', icon: 'pi pi-verified', routerLink: '/admin/approvals' },
    { label: 'دليل الأدوية', icon: 'pi pi-book', routerLink: '/admin/drugs' },
    { label: 'جميع الطلبات', icon: 'pi pi-shopping-bag', routerLink: '/admin/orders' },
  ];
}
