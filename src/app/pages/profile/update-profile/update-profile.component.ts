import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ProfileService } from '../../../core/services/profile.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-update-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './update-profile.component.html'
})
export class UpdateProfileComponent implements OnInit {
    updateForm: FormGroup;
    isLoading = false;
    isFetching = true;
    isPatient = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly profileService: ProfileService,
        private readonly errorHandler: ErrorHandlerService,
        private readonly messageService: MessageService,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef
    ) {
        this.updateForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^(?:\+20|0020|0)?1[0125][0-9]{8}$/)]]
        });
    }

    ngOnInit(): void {
        const role = typeof window !== 'undefined' ? localStorage.getItem('roleName') : null;
        this.isPatient = role === 'Patient';

        const request$: Observable<any> = this.isPatient
            ? this.profileService.getPatientProfile()
            : this.profileService.getProfile();

        request$.subscribe({
            next: (data: any) => {
                this.updateForm.patchValue({
                    fullName: data.fullName ?? data.value?.fullName,
                    phoneNumber: data.phoneNumber ?? data.value?.phoneNumber,
                });
                this.isFetching = false;
                this.cdr.detectChanges();
            },
            error: (err: unknown) => {
                this.isFetching = false;
                this.errorHandler.handleError(err, 'Failed to load profile data');
                this.cdr.detectChanges();
            }
        });
    }

    onSubmit(): void {
        if (this.updateForm.invalid) {
            this.updateForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;

        const payload = this.updateForm.getRawValue();
        const request$: Observable<any> = this.isPatient
            ? this.profileService.updatePatientProfile(payload)
            : this.profileService.updateProfile(payload);

        request$.subscribe({
            next: () => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Profile Updated',
                    detail: 'Your profile has been updated successfully.',
                    life: 3000
                });

                this.router.navigate(['/profile']);
            },
            error: (err: unknown) => {
                this.isLoading = false;
                this.errorHandler.handleError(err, 'Failed to update profile');
                this.cdr.detectChanges();
            }
        });
    }
}