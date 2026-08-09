import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
    selector: 'app-driver-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
    template: `
    <div class="flex flex-col h-screen overflow-hidden bg-canvas font-sans">
      <app-navbar class="flex-shrink-0 z-50 shadow-sm" />

      <div class="flex flex-1 overflow-hidden">
        <app-sidebar [items]="driverNavItems" class="hidden md:block h-full flex-shrink-0" />

        <main class="flex-1 flex flex-col overflow-y-auto bg-canvas-softer">
          <div class="flex-1 p-4 md:p-8">
            <router-outlet></router-outlet>
          </div>
          <app-footer class="flex-shrink-0" />
        </main>
      </div>
    </div>
  `
})
export class DriverLayoutComponent {
    driverNavItems: SidebarItem[] = [
        { label: 'الطلبات المتاحة', icon: 'pi pi-map-marker', routerLink: '/driver/dashboard' },
        { label: 'سجل التوصيل', icon: 'pi pi-history', routerLink: '/driver/history' },
        { label: 'المحفظة', icon: 'pi pi-wallet', routerLink: '/driver/wallet' }
    ];
}