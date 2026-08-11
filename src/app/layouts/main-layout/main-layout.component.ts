import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { routeTransitionAnimations } from '../../shared/animations/route.animations';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  animations: [routeTransitionAnimations]
})
export class MainLayoutComponent {
  private lastState = '';
  prepareRoute(outlet: RouterOutlet) {
    if (outlet && outlet.isActivated) {
      this.lastState = outlet.activatedRoute.snapshot.url.join('');
    }
    return this.lastState;
  }
}
