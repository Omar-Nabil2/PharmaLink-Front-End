import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { routeTransitionAnimations } from '../../shared/animations/route.animations';

@Component({
  selector: 'app-review-team-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent],
  templateUrl: './review-team-layout.component.html',
  styleUrl: './review-team-layout.component.scss',
  animations: [routeTransitionAnimations]
})
export class ReviewTeamLayoutComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('') : '';
  }
  readonly navItems = [
    { label: 'الرئيسية', routerLink: '/review-team/dashboard' },
    { label: 'مراجعة الروشتات', routerLink: '/review-team/prescriptions' },
    { label: 'استفسارات المرضى', routerLink: '/review-team/medical-inquiries' },
    { label: 'طلبات تتطلب مراجعة', routerLink: '/review-team/orders' },
  ];
}
