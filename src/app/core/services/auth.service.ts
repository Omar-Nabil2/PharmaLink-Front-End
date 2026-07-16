import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  ChangePasswordRequest,
} from '../interfaces/auth.interface';
import { clearAuthSession, getAccessToken } from '../utils/auth-storage';
import { AppRole, UserAuthData } from '@core/enums/app-roles.constant';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = environment.baseUrl;
  private readonly omarUrl = environment.omarUrl;

  private currentUserSignal = signal<UserAuthData | null>(this.loadUserFromStorage());

  constructor(private readonly http: HttpClient) {

  }

  // Computed Signals عشان نقرأ الداتا بسهولة في الـ Components
  currentUser = computed(() => this.currentUserSignal());
  isLoggedIn = computed(() => this.currentUserSignal() !== null);
  userRole = computed(() => this.currentUserSignal()?.roleName ?? null);

  private loadUserFromStorage(): UserAuthData | null {
    // لو الداتا محفوظة كـ Object واحد
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      return JSON.parse(storedData) as UserAuthData;
    }

    // أو لو محفوظة كـ Keys منفصلة (بناءً على الصورة)
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

  getNormalizedRole(): string | null {
    const role = this.userRole();
    if (!role) return null;
    const r = role.toLowerCase().replace(/\s+/g, '');
    if (r === 'systemadmin' || r === 'administrator') return 'admin';
    return r;
  }

  hasRole(expectedRole: AppRole): boolean {
    return this.userRole() === expectedRole;
  }

  logout() {
    localStorage.clear(); // أو تمسح الـ Keys المحددة بس
    this.currentUserSignal.set(null);
  }

  // Add this to your AuthService
  getDashboardPath(): string {
    const role = this.getNormalizedRole();

    // Explicitly map roles to your defined routes
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'pharmacist': // Or whatever your role string is
        return '/pharmacy/dashboard'; // Matches your 'pharmacy' route path
      case 'patient':
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
    return this.http.post<RegisterResponse>(`${this.baseUrl}Auth/register`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.omarUrl}Auth/ForgotPassword`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.omarUrl}Auth/ResetPassword`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.omarUrl}Auth/ChangePassword`, data);
  }
  /**
   * Requests a phone verification OTP code.
   * @param userId The unique ID of the user.
   */
  requestPhoneVerification(userId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}PhoneVerification/request`, { userId });
  }

  /**
   * Verifies the phone code entered by the user.
   * @param userId The unique ID of the user.
   * @param code The 6-digit OTP code.
   */
  verifyPhone(userId: string, code: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}PhoneVerification/verify`, { userId, code });
  }

  /**
   * Logs in a user.
   * @param data LoginRequest DTO containing credentials.
   */
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}Auth/login`, data);
  }
}
