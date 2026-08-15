import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PushNotificationService } from '@core/services/push-notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications implements OnInit {
  pushService = inject(PushNotificationService);
  router = inject(Router);
  
  notifications: any[] = [];
  unreadCount = 0;

  ngOnInit() {
    this.fetchNotifications();
    this.pushService.liveNotifications$.subscribe(notification => {
      this.notifications.unshift(notification);
      this.unreadCount++;
    });
  }

  fetchNotifications() {
    this.pushService.getNotifications().subscribe(data => {
      this.notifications = data;
      this.unreadCount = data.filter(n => !n.isRead).length;
    });
  }

  markAsRead(notification: any, event: Event) {
    event.stopPropagation();
    if (!notification.isRead) {
      notification.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.pushService.markAsRead(notification.id).subscribe();
    }
  }

  clickNotification(notification: any) {
    if (!notification.isRead) {
      notification.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.pushService.markAsRead(notification.id).subscribe();
    }
    
    if (notification.url) {
      this.router.navigateByUrl(notification.url);
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.unreadCount = 0;
    this.pushService.markAllAsRead().subscribe();
  }
}

