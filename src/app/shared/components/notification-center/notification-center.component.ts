import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PushNotificationService } from '@core/services/push-notification.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html'
})
export class NotificationCenterComponent implements OnInit {
  pushService = inject(PushNotificationService);
  router = inject(Router);
  authService = inject(AuthService);
  
  unreadCount = 0;

  ngOnInit() {
    // Initial fetch to get unread count
    this.pushService.getNotifications().subscribe(data => {
      this.unreadCount = data.filter(n => !n.isRead).length;
    });

    // Listen to new live notifications to increment unread count
    this.pushService.liveNotifications$.subscribe(notification => {
      this.unreadCount++;
    });
  }

  goToNotifications() {
    const dashboardPath = this.authService.getDashboardPath();
    const roleBase = dashboardPath.split('/')[1]; // e.g. 'admin' from '/admin/dashboard'
    
    if (roleBase) {
      this.router.navigate([`/${roleBase}/notifications`]);
    } else {
      this.router.navigate(['/notifications']);
    }
  }
}
