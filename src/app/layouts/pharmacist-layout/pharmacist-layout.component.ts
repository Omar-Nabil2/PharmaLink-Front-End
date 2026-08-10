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
  selector: 'app-pharmacist-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './pharmacist-layout.component.html',
  styleUrl: './pharmacist-layout.component.scss',
  animations: [routeTransitionAnimations]
})
export class pharmacistLayoutComponent implements OnInit {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('') : '';
  }
  
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly isMobileSidebarOpen = signal(false);
  readonly userMenuOpen = signal(false);

  readonly fullName = computed(() => this.authService.currentUser()?.fullName || 'صيدلي');
  readonly roleLabel = signal('صيدلي');
  readonly avatarInitial = computed(() => this.fullName().charAt(0).toUpperCase() || 'ص');
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
    { label: 'لوحة التحكم', icon: 'pi pi-home', routerLink: '/pharmacist/dashboard' },
    { label: 'طابور الروشتات', icon: 'pi pi-box', routerLink: '/pharmacist/prescription-queue' },
    { label: 'تحليلات الروشتات', icon: 'pi pi-sparkles', routerLink: '/pharmacist/prescription-analytics' },
    { label: 'الطلبات المعينة', icon: 'pi pi-check-square', routerLink: '/pharmacist/assigned-orders' },
    { label: 'قائمة التجهيز', icon: 'pi pi-cog', routerLink: '/pharmacist/preparation-list' },
    { label: 'المخزون', icon: 'pi pi-box', routerLink: '/pharmacist/inventory' }
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
