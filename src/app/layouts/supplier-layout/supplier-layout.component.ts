import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { routeTransitionAnimations } from '../../shared/animations/route.animations';
import { NotificationCenterComponent } from '../../shared/components/notification-center/notification-center.component';

interface SupplierNavItem {
    label: string;
    icon: string;
    routerLink: string;
}

@Component({
    selector: 'app-supplier-layout',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationCenterComponent],
    templateUrl: './supplier-layout.component.html', // استخدم نفس الـ HTML بتاع الـ Owner مع تغيير النصوص
    styleUrl: './supplier-layout.component.scss',
    animations: [routeTransitionAnimations]
})
export class SupplierLayoutComponent {
    prepareRoute(outlet: RouterOutlet) {
        return outlet && outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('') : '';
    }
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly collapsed = signal(false);
    readonly isMobileSidebarOpen = signal(false);
    readonly userMenuOpen = signal(false);

    readonly fullName = computed(() => this.authService.currentUser()?.fullName || 'شركة الأدوية');
    readonly roleLabel = signal('مورّد (Supplier)');
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
                takeUntilDestroyed()
            )
            .subscribe(() => this.closeMobileSidebar());
    }

    // ─── روابط المورد ───
    readonly navItems: SupplierNavItem[] = [
        { label: 'لوحة التحكم (الطلبات)', icon: 'pi pi-inbox', routerLink: '/supplier/dashboard' },
        { label: 'أدويتي', icon: 'pi pi-box', routerLink: '/supplier/drugs' },
        { label: 'الملف الشخصي', icon: 'pi pi-building', routerLink: '/supplier/profile' },
    ];

    toggleCollapse(): void { this.collapsed.update((v) => !v); }
    toggleMobileSidebar(): void { this.isMobileSidebarOpen.update((v) => !v); }
    closeMobileSidebar(): void { this.isMobileSidebarOpen.set(false); }
    toggleUserMenu(): void { this.userMenuOpen.update((v) => !v); }

    logout(): void {
        this.userMenuOpen.set(false);
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}