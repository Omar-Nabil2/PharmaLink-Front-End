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
  SystemAdminProfile,
  UpdateSystemAdminProfileRequest
} from '../interfaces/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  // private readonly localUrl = environment.localUrl;
 private readonly localUrl ='https://localhost:5001/api/v1';
 
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

  getSystemAdminProfile(): Observable<{ value: SystemAdminProfile } | SystemAdminProfile> {
  return this.http.get<any>(`${this.localUrl}/admin/profile`);
}
updateSystemAdminProfile(data: UpdateSystemAdminProfileRequest): Observable<SystemAdminProfile> {
    return this.http.put<SystemAdminProfile>(`${this.localUrl}/admin/profile`, data);
  }
getPharmacistProfile(): Observable<any> {
    return this.http.get(`${this.localUrl}/PharmacistProfile`);
}

// تحديث بيانات ملف الصيدلي
updatePharmacistProfile(data: any): Observable<any> {
    return this.http.put(`${this.localUrl}/PharmacistProfile`, data); // أو patch حسب الـ Backend لديك
}
}
