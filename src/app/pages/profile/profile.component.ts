import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { GetPharmacyProfileResponse, PatientProfile, SystemAdminProfile } from '../../core/interfaces/profile.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  userRole: string = '';
  
  patientData: PatientProfile | null = null;
  pharmacyData: GetPharmacyProfileResponse | null = null;
  adminData: SystemAdminProfile | null = null;
  
  isLoading = true;

  constructor(
    private readonly profileService: ProfileService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const role = typeof window !== 'undefined' ? localStorage.getItem('roleName') : null;
    this.userRole = role ? role.trim() : '';
    
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
          this.patientData = res.value || res;
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
    } else {
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

  isDefaultAddress(index: number): boolean {
    if (!this.patientData?.addresses) return false;
    const firstDefaultIndex = this.patientData.addresses.findIndex(a => a.isDefault);
    return index === firstDefaultIndex;
  }
}