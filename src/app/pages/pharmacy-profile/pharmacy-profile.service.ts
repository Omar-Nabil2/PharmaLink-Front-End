import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PharmacyProfileResponseDto, UpdatePharmacyProfileDto } from './pharmacy-profile.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.localUrl;
  private readonly endpoint = `${this.baseUrl}/pharmacy/profile`;

  /**
   * Retrieves the current pharmacy profile for the owner.
   */
  getProfile(): Observable<PharmacyProfileResponseDto> {
    return this.http.get<PharmacyProfileResponseDto>(this.endpoint);
  }

  /**
   * Updates the pharmacy profile.
   * Sends data as multipart/form-data.
   */
  updateProfile(data: UpdatePharmacyProfileDto): Observable<void> {
    const formData = new FormData();
    formData.append('PharmacyName', data.PharmacyName);
    
    if (data.LogoFile) {
      formData.append('LogoFile', data.LogoFile);
    }

    return this.http.put<void>(this.endpoint, formData);
  }
}
