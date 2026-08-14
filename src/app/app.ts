import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { filter } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import Swal from 'sweetalert2';

import { PwaInstallService } from '@core/services/pwa-install.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  title = 'Pharma Link';
  isOffline = false;

  constructor(private router: Router, public pwaInstall: PwaInstallService, private swUpdate: SwUpdate) {
    if (typeof window !== 'undefined') {
      this.isOffline = !navigator.onLine;
    }

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter(evt => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        Swal.fire({
          title: 'يوجد تحديث جديد!',
          text: 'تم إصدار نسخة جديدة من التطبيق، اضغط لتحديث الصفحة.',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'تحديث الآن',
          cancelButtonText: 'لاحقاً',
          confirmButtonColor: '#0d9488'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      });
    }
  }

  @HostListener('window:offline', ['$event'])
  onOffline() {
    this.isOffline = true;
  }

  @HostListener('window:online', ['$event'])
  onOnline() {
    this.isOffline = false;
  }

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
