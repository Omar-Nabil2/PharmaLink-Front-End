import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { routeTransitionAnimations } from '../../shared/animations/route.animations';
import { NotificationCenterComponent } from '../../shared/components/notification-center/notification-center.component';

export interface OwnerSubNavItem {
  label: string;
  icon: string;
  routerLink: string;
}

export interface OwnerNavItem {
  label: string;
  icon: string;
  routerLink?: string;
  subItems?: OwnerSubNavItem[];
}

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationCenterComponent],
  templateUrl: './owner-layout.component.html',
  styleUrl: './owner-layout.component.scss',
  animations: [routeTransitionAnimations]
})
export class OwnerLayoutComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('') : '';
  }
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);

  readonly isMobileSidebarOpen = signal(false);

  readonly userMenuOpen = signal(false);

  readonly isAiMenuExpanded = signal(true);

  readonly notificationCount = signal(3);

  readonly fullName = computed(() => this.authService.currentUser()?.fullName || 'مالك الصيدلية');

  readonly roleLabel = signal('مالك صيدلية');

  readonly avatarInitial = computed(() => this.fullName().charAt(0).toUpperCase() || 'م');
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

  toggleAiMenu(): void {
    this.isAiMenuExpanded.update((val) => !val);
  }

  readonly navItems: OwnerNavItem[] = [
    { label: 'لوحة التحكم', icon: 'pi pi-th-large', routerLink: '/owner/dashboard' },
    {
      label: 'الذكاء الاصطناعي',
      icon: 'pi pi-sparkles',
      subItems: [
        { label: 'تحليلات الروشتات', icon: 'pi pi-chart-bar', routerLink: '/owner/prescription-analytics' },
        { label: 'التنبؤ بالمخزون', icon: 'pi pi-chart-line', routerLink: '/owner/ai-forecasting' }
      ]
    },
    { label: 'الصيادلة', icon: 'pi pi-users', routerLink: '/owner/pharmacists' },
    { label: 'المخزون', icon: 'pi pi-box', routerLink: '/owner/inventory' },
    { label: 'الطلبات', icon: 'pi pi-shopping-cart', routerLink: '/owner/orders' },
    { label: 'طلبات المورد', icon: 'pi pi-truck', routerLink: '/owner/supplier-orders' },
    { label: 'الفروع', icon: 'pi pi-sitemap', routerLink: '/owner/branches' },
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
