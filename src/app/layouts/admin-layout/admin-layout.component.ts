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
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/admin/dashboard' },
    { label: 'Manage Users', icon: 'pi pi-users', routerLink: '/admin/users' },
    { label: 'Pharmacy Approvals', icon: 'pi pi-verified', routerLink: '/admin/approvals' },
    { label: 'Drug Catalog', icon: 'pi pi-book', routerLink: '/admin/drugs' },
  ];
}
