import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ProfileService } from '../../core/services/profile.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    profileData: any = null;
    isFetching = true;
    role: string | null = null;

    constructor(
        private readonly profileService: ProfileService,
        private readonly errorHandler: ErrorHandlerService,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.role = typeof window !== 'undefined' ? localStorage.getItem('roleName') : null;
        let request$: Observable<any>;

        if (this.role === 'Patient') {
            request$ = this.profileService.getPatientProfile();
        } else if (this.role === 'Admin') {
            request$ = this.profileService.getSystemAdminProfile();
        } else if (this.role === 'Pharmacist') {
            request$ = this.profileService.getPharmacistProfile();
        } else {
            request$ = this.profileService.getProfile();
        }

        request$.subscribe({
            next: (data: any) => {
                this.profileData = data.value ?? data;
                this.isFetching = false;
                this.cdr.detectChanges();
            },
            error: (err: unknown) => {
                this.isFetching = false;
                this.errorHandler.handleError(err, 'فشل تحميل بيانات الملف الشخصي');
                this.cdr.detectChanges();
            }
        });
    }

    goToEdit(): void {
        if (this.role === 'Admin') {
            this.router.navigate(['/admin/profile/edit']);
        } else {
            this.router.navigate(['/profile/edit']);
        }
    }
}