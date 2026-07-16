import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GetPharmacyProfileResponse, UpdatePharmacyProfileRequest, UpdatePharmacyProfileResponse } from '../interfaces/profile.interface';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private readonly baseUrl = environment.baseUrl;
    private readonly omarUrl = environment.omarUrl;

    constructor(private readonly http: HttpClient) { }

    getProfile(): Observable<GetPharmacyProfileResponse> {

        return this.http.get<GetPharmacyProfileResponse>(`${this.omarUrl}Pharmaciest`);
    }

    updateProfile(data: UpdatePharmacyProfileRequest): Observable<UpdatePharmacyProfileResponse> {
        return this.http.put<UpdatePharmacyProfileResponse>(`${this.omarUrl}Pharmaciest`, data);
    }
}