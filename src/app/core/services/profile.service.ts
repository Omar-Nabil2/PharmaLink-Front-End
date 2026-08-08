import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  GetPharmacyProfileResponse,
  UpdatePatientProfileRequest,
  UpdatePharmacyProfileRequest,
  UpdatePharmacyProfileResponse,
  PatientProfile,
  PatientProfileResponse,
  GetPharmacyAdminProfile,
  UpdatePharmacyAdminProfileDTO
} from '../interfaces/profile.interface';
import { DriverProfile, UpdateDriverProfileRequest } from './driver-profile.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly localUrl = environment.baseUrl;
  private readonly omarUrl = environment.baseUrl;

  constructor(private readonly http: HttpClient) { }

  getProfile(): Observable<GetPharmacyProfileResponse> {
    return this.http.get<GetPharmacyProfileResponse>(`${this.localUrl}/PharmacistProfile`);
  }

  getPatientProfile(): Observable<PatientProfile> {
    return this.http.get<PatientProfile>(`${this.localUrl}/patients/profile`);
  }

  updatePatientProfile(data: UpdatePatientProfileRequest): Observable<PatientProfile> {
    return this.http.put<PatientProfile>(`${this.localUrl}/patients/profile`, data);
  }

  uploadPatientProfilePicture(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('Image', file);
    return this.http.put<void>(`${this.localUrl}/patients/profile/picture`, formData);
  }

  getPatientProfilePictureUrl(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.localUrl}/patients/profile/picture`);
  }

  updateProfile(data: UpdatePharmacyProfileRequest): Observable<UpdatePharmacyProfileResponse> {
    return this.http.put<UpdatePharmacyProfileResponse>(`${this.localUrl}/PharmacistProfile`, data);
  }

  getPharmacyAdminProfile() {
    return this.http.get<GetPharmacyAdminProfile>(`${this.localUrl}/PharmacyAdminProfile`);
  }

  updatePharmacyAdminProfile(data: UpdatePharmacyAdminProfileDTO) {
    return this.http.put<any>(`${this.localUrl}/PharmacyAdminProfile`, data, { responseType: 'text' });
  }

  getDriverProfile(): Observable<DriverProfile> {
    return this.http.get<DriverProfile>(this.localUrl + '/DriverProfile');
  }

  updateDriverProfile(data: UpdateDriverProfileRequest): Observable<any> {
    return this.http.put<any>(this.localUrl + '/DriverProfile', data);
  }

}
