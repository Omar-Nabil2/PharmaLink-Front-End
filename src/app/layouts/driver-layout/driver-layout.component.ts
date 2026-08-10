import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { routeTransitionAnimations } from '../../shared/animations/route.animations';

export interface SidebarItem {
  label: string;
  icon?: string;
  routerLink: string;
}

@Component({
  selector: 'app-driver-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './driver-layout.component.html',
  styleUrl: './driver-layout.component.scss',
  animations: [routeTransitionAnimations],
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
export class DriverLayoutComponent implements OnInit {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('') : '';
  }
  
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly isMobileSidebarOpen = signal(false);
  readonly userMenuOpen = signal(false);

  readonly fullName = computed(() => this.authService.currentUser()?.fullName || 'عامل التوصيل');
  readonly roleLabel = signal('عامل توصيل');
  readonly avatarInitial = computed(() => this.fullName().charAt(0).toUpperCase() || 'ع');
  profilePictureUrl: string | null = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.profilePictureUrl = localStorage.getItem('profilePictureUrl');
    }
  }

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMobileSidebar());
  }

  readonly navItems: SidebarItem[] = [
    { label: 'الطلبات المتاحة', icon: 'pi pi-map-marker', routerLink: '/driver/dashboard' },
    { label: 'سجل التوصيل', icon: 'pi pi-history', routerLink: '/driver/history' },
    { label: 'المحفظة', icon: 'pi pi-wallet', routerLink: '/driver/wallet' }
  ];
  
  driverNavItems: SidebarItem[] = [
    { label: 'الطلبات المتاحة', icon: 'pi pi-map-marker', routerLink: '/driver/dashboard' },
    { label: 'سجل التوصيل', icon: 'pi pi-history', routerLink: '/driver/history' }
  ];

  toggleCollapse(): void {
    this.collapsed.update((value) => !value);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((value) => !value);
  }

  openMobileSidebar(): void {
    this.isMobileSidebarOpen.set(true);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((value) => !value);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}