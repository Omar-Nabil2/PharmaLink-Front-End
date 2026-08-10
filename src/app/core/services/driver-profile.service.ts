import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface DriverProfile {
    driverId: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    vehicleInfo: string;
    status: number;
    totalCompletedJobs: number;
}

export interface UpdateDriverProfileRequest {
    fullName: string;
    phoneNumber: string;
    vehicleInfo: string;
}

@Injectable({
    providedIn: 'root'
})
export class DriverProfileService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.baseUrl}/api/v1/DriverProfile`;

    getProfile(): Observable<DriverProfile> {
        return this.http.get<DriverProfile>(this.baseUrl);
    }

    updateProfile(data: UpdateDriverProfileRequest): Observable<any> {
        return this.http.put<any>(this.baseUrl, data);
    }
}