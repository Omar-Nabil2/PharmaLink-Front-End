import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { GetPharmacyProfileResponse, PatientProfile } from '../../core/interfaces/profile.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  isPatient = false;
  patientData: PatientProfile | null = null;
  profileData: GetPharmacyProfileResponse | null = null;
  isLoading = true;

  constructor(
    private readonly profileService: ProfileService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const role = typeof window !== 'undefined' ? localStorage.getItem('roleName') : null;
    this.isPatient = (role === 'Patient');
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.isLoading = true;
    if (this.isPatient) {
      this.profileService.getPatientProfile().subscribe({
        next: (response) => {
          console.log('Patient profile response:', response);
          this.patientData = response.value;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorHandler.handleError(err, 'فشل تحميل الملف الشخصي للمريض');
          this.cdr.detectChanges();
        },
      });
    } else {
      this.profileService.getProfile().subscribe({
        next: (data) => {
          console.log('Pharmacy profile response:', data);

          this.profileData = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorHandler.handleError(err, 'فشل تحميل الملف الشخصي');
          this.cdr.detectChanges();
        },
      });
    }
  }

  isDefaultAddress(index: number): boolean {
    if (!this.patientData?.addresses) return false;
    const firstDefaultIndex = this.patientData.addresses.findIndex(a => a.isDefault);
    return index === firstDefaultIndex;
  }
}
