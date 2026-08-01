

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
    isPharmacyAdmin = false;

    // ضفنا المتغير ده عشان نحفظ فيه البيانات الأصلية
    originalData: { fullName: string; phoneNumber: string } = { fullName: '', phoneNumber: '' };

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
            phoneNumber: ['', [Validators.required, Validators.pattern(/^(?:\+20|0020|0)?1[0125][0-9]{8}$/)]],
            email: [{ value: '', disabled: true }],
            legalName: [{ value: '', disabled: true }]
        });
    }

    ngOnInit(): void {
        const role = typeof window !== 'undefined' ? localStorage.getItem('roleName') : null;
        this.isPharmacyAdmin = role === 'PharmacyAdmin';

        let request$: Observable<any>;

        if (role === 'Patient') {
            request$ = this.profileService.getPatientProfile();
        } else if (role === 'PharmacyAdmin') {
            request$ = this.profileService.getPharmacyAdminProfile();
        } else if (role === 'Pharmacist') {
            request$ = this.profileService.getProfile();
        } else {
            request$ = this.profileService.getProfile();
        }

        request$.subscribe({
            next: (data: any) => {
                // ✅ إضافة ? بعد data لحماية الكود من الانهيار إذا كانت النتيجة null
                const fetchedFullName = data?.fullName ?? data?.value?.fullName ?? '';
                const fetchedPhoneNumber = data?.phoneNumber ?? data?.value?.phoneNumber ?? '';

                // 1. حفظ البيانات الأصلية أول ما تيجي
                this.originalData = {
                    fullName: fetchedFullName,
                    phoneNumber: fetchedPhoneNumber
                };

                this.updateForm.patchValue({
                    fullName: fetchedFullName,
                    phoneNumber: fetchedPhoneNumber,
                    email: data?.email ?? data?.value?.email,
                    legalName: data?.legalName ?? data?.value?.legalName,
                });

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
    onSubmit(): void {
        if (this.updateForm.invalid) {
            this.updateForm.markAllAsTouched();
            return;
        }

        const currentFullName = this.updateForm.get('fullName')?.value;
        const currentPhoneNumber = this.updateForm.get('phoneNumber')?.value;

        // 3. التحقق إذا كانت البيانات لم تتغير (المقارنة)
        if (currentFullName === this.originalData.fullName && currentPhoneNumber === this.originalData.phoneNumber) {
            // إظهار رسالة للمستخدم إنه معملش تعديلات
            this.messageService.add({
                severity: 'info', // لون أزرق أو تنبيه خفيف بدل الأخضر بتاع النجاح
                summary: 'لا توجد تعديلات',
                detail: 'لم تقم بإجراء أي تعديلات جديدة للحفظ.',
                life: 3000
            });

            // توجيهه لصفحة البروفايل من غير ما نكلم الباك إند
            this.router.navigate(['/profile']);
            return;
        }

        this.isLoading = true;
        const role = typeof window !== 'undefined' ? localStorage.getItem('roleName') : null;
        const payload = this.updateForm.getRawValue();

        let request$: Observable<any>;

        if (role === 'Patient') {
            request$ = this.profileService.updatePatientProfile(payload);
        } else if (role === 'Pharmacist') {
            request$ = this.profileService.updateProfile(payload);
        } else if (role === 'PharmacyAdmin') {
            request$ = this.profileService.updatePharmacyAdminProfile(payload); // ✅ التعديل هنا للأدمن
        } else {
            request$ = this.profileService.updateProfile(payload);
        }
        request$.subscribe({
            next: () => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'تم تحديث الملف الشخصي',
                    detail: 'تم تحديث ملفك الشخصي بنجاح.',
                    life: 3000
                });

                this.router.navigate(['/profile']);
            },
            error: (err: unknown) => {
                this.isLoading = false;
                this.errorHandler.handleError(err, 'فشل تحديث الملف الشخصي');
                this.cdr.detectChanges();
            }
        });
    }

}


