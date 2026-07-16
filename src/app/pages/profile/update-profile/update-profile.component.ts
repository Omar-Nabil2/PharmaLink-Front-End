import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
    isFetching = true; // علشان نوري لودينج واحنا بنجيب الداتا القديمة

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
            phoneNumber: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        // 1. نجيب بيانات البروفايل الحالية علشان نملا بيها الفورم
        this.profileService.getProfile().subscribe({
            next: (data) => {
                this.updateForm.patchValue({
                    fullName: data.fullName,
                    phoneNumber: data.phoneNumber
                });
                this.isFetching = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
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

        // 2. نبعت الداتا الجديدة للباك-إند
        this.profileService.updateProfile(this.updateForm.value).subscribe({
            next: () => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Profile Updated',
                    detail: 'Your profile has been updated successfully.',
                    life: 3000
                });

                // 3. نرجعه لصفحة البروفايل تاني
                this.router.navigate(['/profile']);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorHandler.handleError(err, 'Failed to update profile');
                this.cdr.detectChanges();
            }
        });
    }
}