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

    // 1. تأسيس اتصال SignalR
    public startConnection(token: string): void {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.baseUrl}/hubs/delivery`, {
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

    // 3. تتبع الموقع وإرساله عبر SignalR
    private startLocationTracking(): void {
        this.locationInterval = setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
                        this.hubConnection.invoke('UpdateLocation', lng, lat)
                            .catch(err => console.error(err));
                    }
                }, (error) => console.error('GPS Error:', error),
                    { enableHighAccuracy: true });
            }
        }, 5000); // كل 5 ثواني
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