import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-pharmacist-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './pharmacist-layout.component.html',
  styleUrl: './pharmacist-layout.component.scss',
})
export class pharmacistLayoutComponent {
  pharmacistNavItems: SidebarItem[] = [
    { label: 'لوحة التحكم', icon: 'pi pi-home', routerLink: '/pharmacist/dashboard' },
    { label: 'طابور الروشتات', icon: 'pi pi-box', routerLink: '/pharmacist/prescription-queue' },
    { label: 'الطلبات المعينة', icon: 'pi pi-check-square', routerLink: '/pharmacist/assigned-orders' },
    { label: 'قائمة التجهيز', icon: 'pi pi-cog', routerLink: '/pharmacist/preparation-list' },
    { label: 'المخزون', icon: 'pi pi-box', routerLink: '/pharmacist/inventory' }
  ];
}
