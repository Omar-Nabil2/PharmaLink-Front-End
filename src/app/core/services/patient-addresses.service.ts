import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { PatientAddress } from '../interfaces/profile.interface';
import { CreatePatientAddressRequest, UpdatePatientAddressRequest, PatientAddressesResponse, PatientAddressResponse } from '../interfaces/patient-address.interface';

@Injectable({
  providedIn: 'root'
})
export class PatientAddressesService {
  private readonly baseUrl = environment.localUrl + '/PatientAddresses';

  constructor(private http: HttpClient) {}

  getMyAddresses(): Observable<PatientAddress[]> {
    console.log('Sending GET request to:', `${this.baseUrl}/MyAddresses`);
    return this.http.get<any>(`${this.baseUrl}/MyAddresses`)
      .pipe(
        map(response => {
          console.log('Received response:', response);
          if (!response) return [];
          return Array.isArray(response) ? response : (response.value || []);
        })
      );
  }

  getAddressById(id: string): Observable<PatientAddress> {
    console.log('Sending GET request to:', `${this.baseUrl}/${id}`);
    return this.http.get<any>(`${this.baseUrl}/${id}`)
      .pipe(map(response => {
        console.log('Received response for getAddressById:', response);
        if (!response) return response;
        // Check if the backend accidentally returned an array of length 1 for this endpoint
        if (Array.isArray(response) && response.length > 0) {
          return response[0];
        }
        return response.value !== undefined ? response.value : response;
      }));
  }

  createAddress(data: CreatePatientAddressRequest): Observable<PatientAddress> {
    return this.http.post<any>(this.baseUrl, data)
      .pipe(map(response => {
        if (!response) return response;
        return response.value !== undefined ? response.value : response;
      }));
  }

  updateAddress(id: string, data: UpdatePatientAddressRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, data);
  }

  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  setDefaultAddress(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/default`, {});
  }
}
