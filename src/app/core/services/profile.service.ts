import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  GetPharmacyProfileResponse,
  UpdatePatientProfileRequest,
  UpdatePharmacyProfileRequest,
  UpdatePharmacyProfileResponse,
  PatientProfileResponse,
} from '../interfaces/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly localUrl = environment.localUrl;

  constructor(private readonly http: HttpClient) { }

  getProfile(): Observable<GetPharmacyProfileResponse> {
    return this.http.get<GetPharmacyProfileResponse>(`${this.localUrl}/PharmacistProfile`);
  }

  getPatientProfile(): Observable<PatientProfileResponse> {
    return this.http.get<PatientProfileResponse>(`${this.localUrl}/patients/profile`);
  }

  updatePatientProfile(data: UpdatePatientProfileRequest): Observable<PatientProfileResponse> {
    return this.http.put<PatientProfileResponse>(`${this.localUrl}/patients/profile`, data);
  }

  updateProfile(data: UpdatePharmacyProfileRequest): Observable<UpdatePharmacyProfileResponse> {
    return this.http.put<UpdatePharmacyProfileResponse>(`${this.localUrl}/PharmacistProfile`, data);
  }

}
