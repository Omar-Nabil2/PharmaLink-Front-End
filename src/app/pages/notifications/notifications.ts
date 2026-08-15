import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
  cdr = inject(ChangeDetectorRef);
  
  notifications: any[] = [];
  unreadCount = 0;

  ngOnInit() {
    this.fetchNotifications();
    this.pushService.liveNotifications$.subscribe(notification => {
      this.notifications.unshift(notification);
      this.unreadCount++;
      this.cdr.detectChanges();
    });
  }

  fetchNotifications() {
    this.pushService.getNotifications().subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.notifications = data;
          this.unreadCount = data.filter(n => n.isRead === false || n.IsRead === false).length;
        } else if (data && typeof data === 'object' && data['$values']) {
          this.notifications = data['$values'];
          this.unreadCount = this.notifications.filter(n => n.isRead === false || n.IsRead === false).length;
        } else {
          this.notifications = [];
          this.unreadCount = 0;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load notifications', err);
        this.notifications = [];
        this.cdr.detectChanges();
      }
    });
  }

  markAsRead(notification: any, event: Event) {
    event.stopPropagation();
    if (!notification.isRead && !notification.IsRead) {
      notification.isRead = true;
      notification.IsRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.pushService.markAsRead(notification.id || notification.Id).subscribe();
      this.cdr.detectChanges();
    }
  }

  clickNotification(notification: any) {
    if (!notification.isRead && !notification.IsRead) {
      notification.isRead = true;
      notification.IsRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.pushService.markAsRead(notification.id || notification.Id).subscribe();
    }
    
    const url = notification.url || notification.Url;
    if (url) {
      this.router.navigateByUrl(url);
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => {
      n.isRead = true;
      n.IsRead = true;
    });
    this.unreadCount = 0;
    this.pushService.markAllAsRead().subscribe();
    this.cdr.detectChanges();
  }
}

