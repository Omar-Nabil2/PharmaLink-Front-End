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
    isDriver = false; // 👈 متغير جديد للطيار

    // 👈 ضفنا vehicleInfo هنا
    originalData: { fullName: string; phoneNumber: string; vehicleInfo?: string } = { fullName: '', phoneNumber: '' };

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
            legalName: [{ value: '', disabled: true }],
            vehicleInfo: [''] // 👈 حقل اختياري في البداية، هنخليه مطلوب لو هو طيار
        });
    }

    ngOnInit(): void {
        const role = typeof window !== 'undefined' ? localStorage.getItem('roleName') : null;
        this.isPharmacyAdmin = role === 'PharmacyAdmin';
        this.isDriver = role === 'DeliveryDriver'; // 👈 تحديد إذا كان اليوزر طيار

        // لو اليوزر طيار، نفعّل حقل الـ vehicleInfo ونخليه مطلوب
        if (this.isDriver) {
            this.updateForm.get('vehicleInfo')?.setValidators([Validators.required]);
            this.updateForm.get('vehicleInfo')?.updateValueAndValidity();
        }

        let request$: Observable<any>;

        // 👈 تحديد مصدر الداتا بناءً على الـ Role
        if (role === 'Patient') {
            request$ = this.profileService.getPatientProfile();
        } else if (role === 'PharmacyAdmin') {
            request$ = this.profileService.getPharmacyAdminProfile();
        } else if (role === 'DeliveryDriver') {
            request$ = this.profileService.getDriverProfile(); // 👈 لازم تكون ضايف الدالة دي في ProfileService
        } else if (role === 'Admin' || role === 'SystemAdmin') {
            request$ = this.profileService.getSystemAdminProfile();
        } else if (role === 'Pharmacist') {
            request$ = this.profileService.getProfile();
        } else {
            request$ = this.profileService.getProfile(); // للصيدلي والـ Admin
        }

        request$.subscribe({
            next: (data: any) => {
                const fetchedFullName = data?.fullName ?? data?.value?.fullName ?? '';
                const fetchedPhoneNumber = data?.phoneNumber ?? data?.value?.phoneNumber ?? '';
                const fetchedVehicleInfo = data?.vehicleInfo ?? data?.value?.vehicleInfo ?? ''; // 👈 جلب بيانات المركبة

                this.originalData = {
                    fullName: fetchedFullName,
                    phoneNumber: fetchedPhoneNumber,
                    vehicleInfo: fetchedVehicleInfo
                };

                this.updateForm.patchValue({
                    fullName: fetchedFullName,
                    phoneNumber: fetchedPhoneNumber,
                    email: data?.email ?? data?.value?.email,
                    legalName: data?.legalName ?? data?.value?.legalName,
                    vehicleInfo: fetchedVehicleInfo // 👈 تعبئة الفورم
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
        const currentVehicleInfo = this.updateForm.get('vehicleInfo')?.value;

        // 👈 مقارنة شاملة للبيانات
        if (currentFullName === this.originalData.fullName &&
            currentPhoneNumber === this.originalData.phoneNumber &&
            (this.isDriver ? currentVehicleInfo === this.originalData.vehicleInfo : true)) {

            this.messageService.add({
                severity: 'info',
                summary: 'لا توجد تعديلات',
                detail: 'لم تقم بإجراء أي تعديلات جديدة للحفظ.',
                life: 3000
            });

            this.router.navigate(['/profile']);
            // توجيهه لصفحة البروفايل من غير ما نكلم الباك إند
            this.router.navigate([this.getProfileLink()]);
            return;
        }

        this.isLoading = true;
        const role = typeof window !== 'undefined' ? localStorage.getItem('roleName') : null;

        // جلب البيانات من الفورم
        const payload = this.updateForm.getRawValue();

        let request$: Observable<any>;

        // 👈 توجيه التحديث بناءً على الـ Role
        if (role === 'Patient') {
            request$ = this.profileService.updatePatientProfile(payload);
        } else if (role === 'PharmacyAdmin') {
            request$ = this.profileService.updatePharmacyAdminProfile(payload);
        } else if (role === 'DeliveryDriver') {
            // نبعت الـ payload اللي بيحتوي على vehicleInfo
            request$ = this.profileService.updateDriverProfile({
                fullName: payload.fullName,
                phoneNumber: payload.phoneNumber,
                vehicleInfo: payload.vehicleInfo
            });
        } else if (role === 'Admin' || role === 'SystemAdmin') {
            request$ = this.profileService.updateSystemAdminProfile(payload);
        } else {
            request$ = this.profileService.updateProfile(payload);
        }

        request$.subscribe({
            next: (res: any) => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'تم تحديث الملف الشخصي',
                    detail: 'تم تحديث ملفك الشخصي بنجاح.',
                    life: 3000
                });

                // تحديث الاسم في الهيدر لو اتغير
                const updatedName = res?.fullName || payload.fullName;
                if (updatedName) {
                    localStorage.setItem('fullName', updatedName);
                }

                // 👈 لو طيار يرجع للداشبورد بتاعته، غير كده يرجع للبروفايل العادي
                if (this.isDriver) {
                    this.router.navigate(['/driver/dashboard']);
                } else {
                    this.router.navigate(['/profile']);
                }
                this.router.navigate([this.getProfileLink()]);
            },
            error: (err: unknown) => {
                this.isLoading = false;
                this.errorHandler.handleError(err, 'فشل تحديث الملف الشخصي');
                this.cdr.detectChanges();
            }
        });
    }


    getProfileLink(): string {
        const roleStr = typeof window !== 'undefined' ? localStorage.getItem('roleName')?.toLowerCase() : '';
        if (roleStr === 'patient') return '/patient/profile';
        if (roleStr === 'pharmacist') return '/pharmacist/profile';
        if (roleStr === 'admin' || roleStr === 'systemadmin') return '/admin/profile';
        if (roleStr === 'pharmacyadmin') return '/owner/profile';
        if (roleStr === 'prescriptionreviewteam') return '/review-team/profile';
        if (roleStr === 'supplier') return '/supplier/profile';
        if (roleStr === 'deliverydriver') return '/driver/profile';
        return '/profile';
    }
}
