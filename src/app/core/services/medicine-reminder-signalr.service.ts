import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';

export interface MedicineReminderNotification {
  medicineName: string;
  dosage?: string;
  notes?: string;
  time: string;
}

@Injectable({ providedIn: 'root' })
export class MedicineReminderSignalrService implements OnDestroy {
  private hubConnection: signalR.HubConnection | null = null;

  /** أي component يعمل subscribe عليه هيستلم الـ notification */
  public reminder$ = new Subject<MedicineReminderNotification>();

  private patientId: string | null = null;

  connect(patientId: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) return;

    this.patientId = patientId;
    const baseUrl = environment.baseUrl.replace('/api/v1', '');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/reminders?patientId=${patientId}`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMedicineReminder', (data: MedicineReminderNotification) => {
      console.log('[ReminderHub] Received notification from server:', data);
      this.reminder$.next(data);
    });

    this.hubConnection
      .start()
      .then(() => console.log('[ReminderHub] Connected for patient', patientId))
      .catch(err => console.error('[ReminderHub] Connection error:', err));
  }

  disconnect() {
    this.hubConnection?.stop();
    this.hubConnection = null;
  }

  ngOnDestroy() { this.disconnect(); }
}
