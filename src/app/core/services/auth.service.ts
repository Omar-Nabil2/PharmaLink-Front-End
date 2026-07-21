import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  ChangePasswordRequest,
} from '../interfaces/auth.interface';
import { AppRole, AppRoles, UserAuthData } from '@core/enums/app-roles.constant';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly localUrl = environment.localUrl;

  private currentUserSignal = signal<UserAuthData | null>(this.loadUserFromStorage());

  constructor(private readonly http: HttpClient) {}

  currentUser = computed(() => this.currentUserSignal());
  isLoggedIn = computed(() => this.currentUserSignal() !== null);
  userRole = computed(() => this.currentUserSignal()?.roleName ?? null);

  private loadUserFromStorage(): UserAuthData | null {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      return JSON.parse(storedData) as UserAuthData;
    }

    const accessToken = localStorage.getItem('accessToken');
    const roleName = localStorage.getItem('roleName') as AppRole;

    if (accessToken && roleName) {
      return {
        accessToken,
        userId: localStorage.getItem('userId') || '',
        fullName: localStorage.getItem('fullName') || '',
        email: localStorage.getItem('email') || '',
        roleName
      };
    }
    return null;
  }

  setCurrentUser(data: UserAuthData): void {
    this.currentUserSignal.set(data);
  }

  /**
   * Normalizes any input role string into a canonical AppRole enum value (or null).
   */
  normalizeRole(role: string | null | undefined): AppRole | null {
    if (!role) return null;
    const r = role.toLowerCase().replace(/\s+/g, '');
    if (r === 'admin' || r === 'systemadmin' || r === 'administrator') return AppRoles.Admin;
    if (r === 'pharmacist') return AppRoles.Pharmacist;
    if (r === 'pharmacyadmin' || r === 'owner' || r === 'pharmacyowner') return AppRoles.PharmacyAdmin;
    if (r === 'patient') return AppRoles.Patient;
    return null;
  }

  getNormalizedRole(): AppRole | null {
    return this.normalizeRole(this.userRole());
  }

  hasRole(expectedRole: AppRole): boolean {
    const current = this.getNormalizedRole();
    const expected = this.normalizeRole(expectedRole);
    return current !== null && current === expected;
  }

  logout() {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (token && refreshToken) {
      // Best effort revocation
      this.revokeToken({ token, refreshToken }).subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession() {
    localStorage.clear();
    this.currentUserSignal.set(null);
  }

  getDashboardPath(): string {
    const role = this.getNormalizedRole();

    switch (role) {
      case AppRoles.Admin:
        return '/admin/dashboard';
      case AppRoles.PharmacyAdmin:
        return '/owner/dashboard';
      case AppRoles.Pharmacist:
        return '/pharmacist/dashboard';
      case AppRoles.Patient:
        return '/patient/dashboard';
      default:
        return '/';
    }
  }

  /**
   * Registers a new patient.
   * @param data RegisterRequest DTO containing patient registration details.
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.localUrl}/Auth/register`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.localUrl}/Auth/ForgotPassword`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.localUrl}/Auth/ResetPassword`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.localUrl}/Auth/change-password`, data);
  }

  /**
   * Requests a phone verification OTP code.
   * @param userId The unique ID of the user.
   */
  requestPhoneVerification(userId: string): Observable<any> {
    return this.http.post<any>(`${this.localUrl}/PhoneVerification/request`, { userId });
  }

  /**
   * Verifies the phone code entered by the user.
   * @param userId The unique ID of the user.
   * @param code The 6-digit OTP code.
   */
  verifyPhone(userId: string, code: string): Observable<any> {
    return this.http.post<any>(`${this.localUrl}/PhoneVerification/verify`, { userId, code });
  }

  /**
   * Logs in a user.
   * @param data LoginRequest DTO containing credentials.
   */
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.localUrl}/Auth/login`, data);
  }

  refreshToken(data: { token: string, refreshToken: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.localUrl}/Auth/refresh`, data);
  }

  revokeToken(data: { token: string, refreshToken: string }): Observable<any> {
    return this.http.post(`${this.localUrl}/Auth/revoke-refresh-token`, data);
  }
}
