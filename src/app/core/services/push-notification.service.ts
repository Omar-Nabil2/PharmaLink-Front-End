import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { MessageService } from 'primeng/api';
import { take, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private hubConnection: signalR.HubConnection | null = null;
  private liveNotificationSubject = new Subject<any>();
  public liveNotifications$ = this.liveNotificationSubject.asObservable();
  
  private authService = inject(AuthService);

  constructor(
    private swPush: SwPush,
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router
  ) {
    if (this.swPush.isEnabled) {
      this.swPush.notificationClicks.subscribe(({ action, notification }) => {
        if (notification.data && notification.data.url) {
          this.router.navigateByUrl(notification.data.url);
        }
      });
    }

    this.initSignalR();
  }

  private initSignalR() {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.baseUrl.replace('/api/v1', '')}/hubs/notification?userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveNotification', (notification) => {
      // Show toast
      this.messageService.add({
        severity: 'info',
        summary: notification.title,
        detail: notification.message,
        life: 5000
      });
      // Broadcast for NotificationCenterComponent to update its list
      this.liveNotificationSubject.next(notification);
    });

    this.hubConnection.start()
      .then(() => console.log('SignalR NotificationHub connected'))
      .catch(err => console.error('Error while starting SignalR connection:', err));
  }

  get subscription() {
    return this.swPush.subscription;
  }

  get isEnabled() {
    return this.swPush.isEnabled;
  }

  subscribeToNotifications(): void {
    if (!this.swPush.isEnabled) {
      this.messageService.add({
        severity: 'warn',
        summary: 'غير مدعوم',
        detail: 'الإشعارات غير مدعومة في متصفحك أو تم إيقافها.'
      });
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: environment.vapidPublicKey
    })
    .then(sub => {
      // Send subscription to backend
      this.http.post(`${environment.baseUrl}/notifications/subscribe`, sub).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم التفعيل',
            detail: 'تم تفعيل الإشعارات بنجاح!'
          });
        },
        error: (err) => {
          console.error('Could not send subscription to server', err);
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء حفظ اشتراك الإشعارات في الخادم.'
          });
        }
      });
    })
    .catch(err => {
      console.error('Could not subscribe to notifications', err);
      this.messageService.add({
        severity: 'warn',
        summary: 'تم الرفض',
        detail: 'تم رفض إذن إرسال الإشعارات أو حدث خطأ.'
      });
    });
  }

  unsubscribeFromNotifications(): void {
    if (!this.swPush.isEnabled) return;

    this.swPush.subscription.pipe(take(1)).subscribe(sub => {
      if (!sub) return;
      
      // Unsubscribe locally
      this.swPush.unsubscribe()
        .then(() => {
          // Send request to backend to delete from DB
          this.http.post(`${environment.baseUrl}/notifications/unsubscribe`, { endpoint: sub.endpoint }).subscribe({
            next: () => {
              this.messageService.add({ severity: 'info', summary: 'تم الإيقاف', detail: 'تم إيقاف الإشعارات بنجاح.' });
            },
            error: (err) => console.error('Error unsubscribing on backend', err)
          });
        })
        .catch(err => {
          console.error('Error unsubscribing locally', err);
        });
    });
  }

  getNotifications() {
    return this.http.get<any[]>(`${environment.baseUrl}/notifications`);
  }

  markAsRead(id: string) {
    return this.http.put(`${environment.baseUrl}/notifications/${id}/read`, {});
  }

  markAllAsRead() {
    return this.http.put(`${environment.baseUrl}/notifications/read-all`, {});
  }
}
