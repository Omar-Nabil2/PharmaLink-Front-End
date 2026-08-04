import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';

export interface PoNotificationDto {
    branchId: string;
    drugName: string;
    currentStock: number;
    predictedStockoutDate: string | null;
    recommendedOrderQuantity: number;
    aiRationale: string;
}

@Injectable({
    providedIn: 'root'
})
export class SignalrService {


    private hubConnection: signalR.HubConnection | undefined;

    // Subject عشان الكومبوننت تعمل عليه Subscribe
    public poCreated$ = new Subject<PoNotificationDto>();

    constructor() {
        this.startConnection();
    }

    private startConnection() {
        // افترضت إن الـ Hub عندك في الباك إند اسمه /notifications-hub
        // غيره بالاسم اللي إنت عامله في الـ Program.cs في الباك إند
        const baseUrl = environment.baseUrl.replace('/api/v1', '');
        const hubUrl = `${baseUrl}/inventory-hub`;

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                // لو الـ Hub محتاج Token، بنبعته هنا
                accessTokenFactory: () => localStorage.getItem('token') || ''
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection
            .start()
            .then(() => {
                console.log('SignalR Connected Successfully!');
                this.addListeners();
            })
            .catch(err => console.error('Error while starting connection: ' + err));
    }

    private addListeners() {
        if (!this.hubConnection) return;

        // اسم الـ Event اللي الباك إند بيبعته (مثلاً ReceivePoNotification)
        // لازم يكون متطابق بالمللي مع اللي مكتوب في الـ C#
        this.hubConnection.on('ReceivePoAlert', (notification: PoNotificationDto) => {
            this.poCreated$.next(notification);
        });
    }


    public async subscribeToBranch(branchId: string) {
        if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.hubConnection.invoke('SubscribeToBranch', branchId);
            } catch (err) {
                console.error('Error subscribing to branch:', err);
            }
        }
    }

    public async unsubscribeFromBranch(branchId: string) {
        if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.hubConnection.invoke('UnsubscribeFromBranch', branchId);
            } catch (err) {
                console.error('Error unsubscribing from branch:', err);
            }
        }
    }
}