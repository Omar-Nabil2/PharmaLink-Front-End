import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AddressResponse } from '../interfaces/address.interface';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly http: HttpClient) {}

  getMyAddresses(): Observable<AddressResponse[]> {
    return this.http.get<AddressResponse[]>(`${this.baseUrl}/PatientAddresses/MyAddresses`);
  }
}