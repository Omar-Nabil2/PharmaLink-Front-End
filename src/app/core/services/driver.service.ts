import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '@environments/environment';

export interface DeliveryJobNotification {
    jobId: string;
    pharmacyName: string;
    fullAddress: string;
    deliveryFee: number;
    distanceKm: number;
}

@Injectable({
    providedIn: 'root'
})
export class DriverService {
    private baseUrl = environment.baseUrl;
    private hubConnection!: signalR.HubConnection;

    // Subjects عشان نبلغ الـ Component بالتحديثات
    public newJobReceived$ = new Subject<DeliveryJobNotification>();
    public jobRemoved$ = new Subject<string>();

    private locationInterval: any;

    constructor(private http: HttpClient) { }

    // دالة بسيطة بفك تشفير الـ JWT وتطلع الـ userId
    private getUserIdFromToken(): string | null {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) return null;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);

            // 👇 السر هنا: ضفنا UserID بنفس الحروف الكابيتال اللي طالعة عندك في الكونسول 👇
            return payload.UserID ||
                payload.userId ||
                payload.sub ||
                payload.nameid ||
                payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                null;

        } catch (e) {
            console.error("خطأ في فك التوكن:", e);
            return null;
        }
    }

    // 1. تأسيس اتصال SignalR
    public startConnection(token: string): void {
        const baseUrlWithoutApi = this.baseUrl.replace('/api/v1', '');
        const hubUrl = `${baseUrlWithoutApi}/hubs/delivery`;
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${hubUrl}`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start()
            .then(() => {
                console.log('Hub Connection Started');
                this.registerSignalREvents();
                this.startLocationTracking(); // نبدأ نبعت اللوكيشن بمجرد الاتصال
            })
            .catch(err => console.error('Error while starting connection: ' + err));
    }

    public stopConnection(): void {
        if (this.hubConnection) {
            this.hubConnection.stop();
            this.stopLocationTracking();
        }
    }

    // 2. استقبال الإشعارات
    private registerSignalREvents(): void {
        this.hubConnection.on('NewDeliveryJob', (job: DeliveryJobNotification) => {
            this.newJobReceived$.next(job);
        });

        this.hubConnection.on('RemoveDeliveryJob', (jobId: string) => {
            this.jobRemoved$.next(jobId);
        });
    }

    private startLocationTracking() {
        this.locationInterval = setInterval(() => {
            if (navigator.geolocation && this.hubConnection.state === signalR.HubConnectionState.Connected) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    // هنا بننادي الدالة اللي بتطلع الـ ID من التوكن
                    const userId = this.getUserIdFromToken();

                    if (userId) {
                        // بنبعت الـ userId اللي طلعناه من التوكن
                        this.hubConnection.invoke('UpdateLocation', userId, lng, lat)
                            .catch(err => console.error('Error sending location:', err));
                    } else {
                        console.warn("مش قادر أحدد الـ userId من التوكن!");
                    }
                });
            }
        }, 500000000000);
    }

    private stopLocationTracking(): void {
        if (this.locationInterval) {
            clearInterval(this.locationInterval);
        }
    }

    // 4. الـ REST APIs لقبول وإنهاء الطلب
    acceptJob(jobId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/api/v1/DeliveryDrivers/jobs/${jobId}/accept`, {});
    }

    completeJob(jobId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/api/v1/DeliveryDrivers/jobs/${jobId}/complete`, {});
    }
}