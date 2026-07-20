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
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/patient/dashboard' },
    { label: 'My Prescriptions', icon: 'pi pi-file-edit', routerLink: '/patient/prescriptions' },
    { label: 'My Cart', icon: 'pi pi-shopping-cart', routerLink: '/patient/cart' },
    { label: 'Order History', icon: 'pi pi-history', routerLink: '/patient/orders' },
    { label: 'Drug Catalog', icon: 'pi pi-search', routerLink: '/patient/drugs' },
  ];
}
