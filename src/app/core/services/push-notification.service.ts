import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  constructor(
    private swPush: SwPush,
    private http: HttpClient,
    private messageService: MessageService
  ) {}

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
}
