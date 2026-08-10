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
  selector: 'app-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  animations: [routeTransitionAnimations]
})
export class AdminLayoutComponent implements OnInit {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('') : '';
  }
  
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly isMobileSidebarOpen = signal(false);
  readonly userMenuOpen = signal(false);

  readonly fullName = computed(() => this.authService.currentUser()?.fullName || 'مسؤول النظام');
  readonly roleLabel = signal('مشرف');
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

  readonly navItems: SidebarItem[] = [
    { label: 'لوحة التحكم', icon: 'pi pi-th-large', routerLink: '/admin/dashboard' },
    { label: 'الصيدليات', icon: 'pi pi-building', routerLink: '/admin/pharmacies' },
    { label: 'مالكو الصيدليات', icon: 'pi pi-user-edit', routerLink: '/admin/pharmacy-owners' },
    { label: 'كتالوج الأدوية', icon: 'pi pi-link', routerLink: '/admin/drugs' },
    { label: 'جميع الطلبات', icon: 'pi pi-list', routerLink: '/admin/orders' },
    { label: 'إدارة المستخدمين', icon: 'pi pi-users', routerLink: '/admin/users' },
    { label: 'موافقات الصيدليات', icon: 'pi pi-verified', routerLink: '/admin/approvals' },
    { label: 'الملف الشخصي', icon: 'pi pi-user', routerLink: '/admin/profile' },
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
