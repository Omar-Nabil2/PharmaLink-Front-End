import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PushNotificationService } from '@core/services/push-notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html'
})
export class NotificationCenterComponent implements OnInit {
  pushService = inject(PushNotificationService);
  router = inject(Router);
  el = inject(ElementRef);
  
  notifications: any[] = [];
  unreadCount = 0;
  isOpen = false;

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

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.fetchNotifications();
    }
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
      this.isOpen = false;
      this.router.navigateByUrl(notification.url);
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.unreadCount = 0;
    this.pushService.markAllAsRead().subscribe();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
