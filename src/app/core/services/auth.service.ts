import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ForgotPasswordRequest, RegisterRequest, RegisterResponse, ResetPasswordRequest } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = environment.baseUrl;
  private readonly omarUrl = environment.omarUrl;

  constructor(private readonly http: HttpClient) { }

  /**
   * Registers a new patient.
   * @param data RegisterRequest DTO containing patient registration details.
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}Auth/register`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.omarUrl}Auth/ForgotPassword`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.omarUrl}Auth/ResetPassword`, data);
  }
}
