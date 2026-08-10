import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { routeTransitionAnimations } from '../../shared/animations/route.animations';

@Component({
  selector: 'app-review-team-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './review-team-layout.component.html',
  styleUrl: './review-team-layout.component.scss',
  animations: [routeTransitionAnimations]
})
export class ReviewTeamLayoutComponent implements OnInit {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('') : '';
  }
  
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly userMenuOpen = signal(false);
  readonly menuOpen = signal(false); // for mobile navigation menu

  readonly fullName = computed(() => this.authService.currentUser()?.fullName || 'تيم المراجعة');
  readonly roleLabel = signal('تيم المراجعة');
  readonly avatarInitial = computed(() => this.fullName().charAt(0).toUpperCase() || 'ت');
  profilePictureUrl: string | null = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.profilePictureUrl = localStorage.getItem('profilePictureUrl');
    }
  }

  readonly navItems = [
    { label: 'الرئيسية', routerLink: '/review-team/dashboard' },
    { label: 'مراجعة الروشتات', routerLink: '/review-team/prescriptions' },
    { label: 'استفسارات المرضى', routerLink: '/review-team/medical-inquiries' },
    { label: 'طلبات تتطلب مراجعة', routerLink: '/review-team/orders' },
  ];

  toggleUserMenu(): void {
    this.userMenuOpen.update((value) => !value);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
