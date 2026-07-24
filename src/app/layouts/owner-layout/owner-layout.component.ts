import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

interface OwnerNavItem {
  label: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './owner-layout.component.html',
  styleUrl: './owner-layout.component.scss',
})
export class OwnerLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);

  readonly isMobileSidebarOpen = signal(false);

  readonly userMenuOpen = signal(false);

  readonly notificationCount = signal(3);

  readonly fullName = computed(() => this.authService.currentUser()?.fullName || 'مالك الصيدلية');

  readonly roleLabel = signal('مالك صيدلية');

  readonly avatarInitial = computed(() => this.fullName().charAt(0).toUpperCase() || 'م');

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMobileSidebar());
  }

  readonly navItems: OwnerNavItem[] = [
    { label: 'لوحة التحكم', icon: 'pi pi-th-large', routerLink: '/owner/dashboard' },
    { label: 'المخزون', icon: 'pi pi-box', routerLink: '/owner/inventory' },
    { label: 'بيانات الصيدلية', icon: 'pi pi-shop', routerLink: '/owner/pharmacy-profile' },
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
