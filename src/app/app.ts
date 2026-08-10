import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  title = 'Pharma Link';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Use setTimeout to ensure the DOM is updated before we attempt to scroll
      setTimeout(() => {
        // Since we disabled body scrolling and moved it to layout containers,
        // we need to find those containers and scroll them.
        const scrollContainers = document.querySelectorAll('.overflow-y-scroll, .overflow-y-auto');
        scrollContainers.forEach(container => {
          container.scrollTo(0, 0);
        });
        
        // Fallback
        window.scrollTo(0, 0);
        document.body.scrollTo(0, 0);
      }, 10);
    });
  }
}
