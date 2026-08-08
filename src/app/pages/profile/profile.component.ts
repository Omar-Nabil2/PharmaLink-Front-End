

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { GetPharmacyProfileResponse, PatientProfile, SystemAdminProfile, GetPharmacyAdminProfile } from '../../core/interfaces/profile.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  serverUrl = environment.baseUrl.replace('/api/v1', '/');
  userRole: string = '';

  patientData: PatientProfile | null = null;
  pharmacyData: GetPharmacyProfileResponse | null = null;
  adminData: SystemAdminProfile | null = null;
  pharmacyAdminData: GetPharmacyAdminProfile | null = null;
  isPharmacyAdmin = false;

  isLoading = true;

  constructor(
    private readonly profileService: ProfileService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const role = typeof window !== 'undefined' ? localStorage.getItem('roleName') : null;
    this.userRole = role ? role.trim() : '';
    this.isPharmacyAdmin = (role === 'PharmacyAdmin');
    console.log('Detected Role in ProfileComponent:', this.userRole);

    this.fetchProfile();
  }

  // 🟢 فحص مرن للأدمن (يتجاهل المسافات وحالة الحروف)
  get isAdminRole(): boolean {
    if (!this.userRole) return false;
    const normalized = this.userRole.toLowerCase().replace(/\s+/g, '');
    return normalized === 'admin' || normalized === 'systemadmin';
  }

  get isPatientRole(): boolean {
    if (!this.userRole) return false;
    return this.userRole.toLowerCase() === 'patient';
  }

  get isPatient(): boolean {
    return this.isPatientRole;
  }

  get profileData(): GetPharmacyProfileResponse | null {
    return this.pharmacyData;
  }

  fetchProfile(): void {
    this.isLoading = true;

    if (this.isPatientRole) {
      this.profileService.getPatientProfile().subscribe({
        next: (res) => {
          this.patientData = res;
          if (this.patientData?.profilePictureUrl) {
             const fullUrl = this.serverUrl + this.patientData.profilePictureUrl;
             localStorage.setItem('profilePictureUrl', fullUrl);
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => this.handleErr(err, 'فشل تحميل الملف الشخصي للمريض')
      });
    } else if (this.isAdminRole) {
      this.profileService.getSystemAdminProfile().subscribe({
        next: (res: any) => {
          const rawData = res.value || res;
          const nameParts = (rawData.fullName || '').trim().split(' ');

          // ضبط حقول الاسم
          this.adminData = {
            ...rawData,
            firstName: rawData.firstName || nameParts[0] || '',
            lastName: rawData.lastName || nameParts.slice(1).join(' ') || '',
            fullName: rawData.fullName || `${rawData.firstName || ''} ${rawData.lastName || ''}`.trim()
          };

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => this.handleErr(err, 'فشل تحميل الملف الشخصي للأدمن')
      });
    }
    else if (this.isPharmacyAdmin) {
      this.profileService.getPharmacyAdminProfile().subscribe({
        next: (response) => {
          this.pharmacyAdminData = response;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorHandler.handleError(err, 'فشل تحميل الملف الشخصي لمدير الصيدلية');
          this.cdr.detectChanges();
        },
      });
    }
    else {
      this.profileService.getProfile().subscribe({
        next: (data) => {
          this.pharmacyData = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => this.handleErr(err, 'فشل تحميل الملف الشخصي للصيدلية')
      });
    }
  }

  private handleErr(err: any, msg: string): void {
    this.isLoading = false;
    this.errorHandler.handleError(err, msg);
    this.cdr.detectChanges();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isLoading = true;
      this.profileService.uploadPatientProfilePicture(file).subscribe({
        next: () => {
          this.profileService.getPatientProfilePictureUrl().subscribe({
            next: (res) => {
              if (res.url && this.patientData) {
                this.patientData.profilePictureUrl = res.url;
                const fullUrl = this.serverUrl + res.url;
                localStorage.setItem('profilePictureUrl', fullUrl);
              }
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.handleErr(err, 'تم رفع الصورة ولكن فشل جلب الرابط الجديد');
            }
          });
        },
        error: (err) => {
          this.handleErr(err, 'فشل في رفع الصورة');
        }
      });
    }
  }

  isDefaultAddress(index: number): boolean {
    if (!this.patientData?.addresses) return false;
    const firstDefaultIndex = this.patientData.addresses.findIndex(a => a.isDefault);
    return index === firstDefaultIndex;
  }

  getEditProfileLink(): string {
    const roleStr = typeof window !== 'undefined' ? localStorage.getItem('roleName')?.toLowerCase() : '';
    if (roleStr === 'patient') return '/patient/profile/edit';
    if (roleStr === 'pharmacist') return '/pharmacist/profile/edit';
    if (roleStr === 'admin' || roleStr === 'systemadmin') return '/admin/profile/edit';
    if (roleStr === 'pharmacyadmin') return '/owner/profile/edit';
    if (roleStr === 'prescriptionreviewteam') return '/review-team/profile/edit';
    if (roleStr === 'supplier') return '/supplier/profile/edit';
    return '/profile/edit';
  }

  getChangePasswordLink(): string {
    const roleStr = typeof window !== 'undefined' ? localStorage.getItem('roleName')?.toLowerCase() : '';
    if (roleStr === 'patient') return '/patient/change-password';
    if (roleStr === 'pharmacist') return '/pharmacist/change-password';
    if (roleStr === 'admin' || roleStr === 'systemadmin') return '/admin/change-password';
    if (roleStr === 'pharmacyadmin') return '/owner/change-password';
    if (roleStr === 'prescriptionreviewteam') return '/review-team/change-password';
    if (roleStr === 'supplier') return '/supplier/change-password';
    return '/change-password';
  }
}

