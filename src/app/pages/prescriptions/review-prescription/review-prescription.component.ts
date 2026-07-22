import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PrescriptionReviewService } from '../../../core/services/prescription-review.service';
import { PrescriptionReviewDto } from '../../../core/interfaces/prescription-review.interface';
import { ChangeDetectorRef } from '@angular/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
// 👇 1. استدعاء الموديول والسيرفيس الخاصة بالـ Toast
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-review-prescription',
    standalone: true,
    // 👇 2. إضافة ToastModule هنا
    imports: [CommonModule, ReactiveFormsModule, RouterModule, AutoCompleteModule, ToastModule],
    // 👇 3. إضافة MessageService في الـ providers
    providers: [MessageService],
    templateUrl: './review-prescription.component.html'
})
export class ReviewPrescriptionComponent implements OnInit {
    reviewForm: FormGroup;
    prescriptionId: string = '';
    prescriptionData: PrescriptionReviewDto | null = null;
    isLoading = true;
    medicineSearchResults: any[] = [];
    filteredMedicines: any[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly reviewService: PrescriptionReviewService,
        private readonly cdr: ChangeDetectorRef,
        // 👇 4. حقن السيرفيس في الكونسراكتور
        private readonly messageService: MessageService
    ) {
        this.reviewForm = this.fb.group({
            notes: [''],
            medicines: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.prescriptionId = this.route.snapshot.paramMap.get('id') || '';
        if (this.prescriptionId) {
            this.loadPrescription();
        }
    }

    get medicines(): FormArray {
        return this.reviewForm.get('medicines') as FormArray;
    }

    loadPrescription(): void {
        this.reviewService.getReview(this.prescriptionId).subscribe({
            next: (data) => {
                if (data.imageUrl) {
                    const lastHttpIndex = data.imageUrl.lastIndexOf('http');
                    if (lastHttpIndex > 0) {
                        data.imageUrl = data.imageUrl.substring(lastHttpIndex);
                    } else if (!data.imageUrl.startsWith('http')) {
                        const prefix = data.imageUrl.startsWith('/') ? '' : '/';
                        data.imageUrl = 'https://pharmalink.tryasp.net' + prefix + data.imageUrl;
                    }
                }

                this.prescriptionData = data;

                if (this.isReadOnly) {
                    this.reviewForm.disable();
                } else {
                    this.reviewForm.enable();
                }

                this.reviewForm.patchValue({ notes: data.reviewNotes });
                this.medicines.clear();

                if (data.medicines && data.medicines.length > 0) {
                    data.medicines.forEach((med: any) => this.addMedicine(med));
                } else {
                    this.addMedicine();
                }

                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading prescription:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    addMedicine(med?: any): void {
        const medicineForm = this.fb.group({
            id: [med?.id || null],
            medicineName: [med?.medicineName || '', Validators.required],
            genericName: [med?.genericName || ''],
            strength: [med?.strength || ''],
            dosageForm: [med?.dosageForm || ''],
            dose: [med?.dose || ''],
            frequency: [med?.frequency || ''],
            duration: [med?.duration || ''],
            quantity: [med?.quantity || 1, [Validators.required, Validators.min(1)]],
            route: [med?.route || '']
        });
        this.medicines.push(medicineForm);
    }

    removeMedicine(index: number): void {
        this.medicines.removeAt(index);
    }

    onSaveUpdates(): void {
        if (this.reviewForm.invalid) {
            // 👇 استبدال الـ alert
            this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'برجاء التأكد من إدخال اسم الدواء والكمية لجميع الأدوية (لا تترك سطراً فارغاً).' });
            return;
        }

        const formMedicines = this.reviewForm.value.medicines;
        const updatePayload = {
            medicines: formMedicines.map((med: any) => ({
                prescriptionReviewMedicineId: med.id,
                medicineName: typeof med.medicineName === 'object' ? med.medicineName.name : med.medicineName,
                genericName: med.genericName,
                strength: med.strength,
                dosageForm: med.dosageForm,
                dose: med.dose,
                frequency: med.frequency,
                duration: med.duration,
                quantity: med.quantity,
                route: med.route
            }))
        };

        this.reviewService.updateReview(this.prescriptionId, updatePayload).subscribe({
            next: (updatedData) => {
                // 👇 استبدال الـ alert
                this.messageService.add({ severity: 'success', summary: 'تم بنجاح', detail: 'تم حفظ الأدوية والجرعات كمسودة بنجاح!' });

                if (updatedData && updatedData.medicines) {
                    this.medicines.clear();
                    updatedData.medicines.forEach((med: any) => this.addMedicine(med));
                    this.cdr.detectChanges();
                }
            },
            error: (err) => {
                let errorMsg = 'حدث خطأ أثناء الحفظ.';
                if (err.error?.errors) {
                    errorMsg = typeof err.error.errors === 'string' ? err.error.errors : JSON.stringify(err.error.errors);
                } else if (err.error?.detail) {
                    errorMsg = err.error.detail;
                } else if (err.error?.title) {
                    errorMsg = err.error.title;
                } else if (typeof err.error === 'string') {
                    errorMsg = err.error;
                }
                // 👇 استبدال الـ alert
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: errorMsg });
            }
        });
    }

    onApprove(): void {
        if (this.reviewForm.invalid) {
            // 👇 استبدال الـ alert
            this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'برجاء إدخال جميع البيانات المطلوبة لجميع الأدوية.' });
            return;
        }

        const formMedicines = this.reviewForm.value.medicines;
        const notes = this.reviewForm.value.notes;
        const updatePayload = {
            medicines: formMedicines.map((med: any) => ({
                prescriptionReviewMedicineId: med.id,
                medicineName: typeof med.medicineName === 'object' ? med.medicineName.name : med.medicineName,
                genericName: med.genericName,
                strength: med.strength,
                dosageForm: med.dosageForm,
                dose: med.dose,
                frequency: med.frequency,
                duration: med.duration,
                quantity: med.quantity,
                route: med.route
            }))
        };

        this.reviewService.updateReview(this.prescriptionId, updatePayload).subscribe({
            next: () => {
                this.reviewService.approve(this.prescriptionId, notes).subscribe({
                    next: () => {
                        // 👇 استبدال الـ alert مع تأخير النقل عشان المستخدم يقرأ الرسالة
                        this.messageService.add({ severity: 'success', summary: 'موافقة', detail: 'تم حفظ الأدوية والموافقة على الروشتة بنجاح!' });
                        setTimeout(() => {
                            this.router.navigate(['/pharmacist/dashboard']);
                        }, 1500);
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تم حفظ الأدوية، لكن السيرفر رفض الموافقة.' });
                    }
                });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل حفظ الأدوية، لذلك لم يتم إرسال طلب الموافقة.' });
            }
        });
    }

    onReject(): void {
        const notes = this.reviewForm.value.notes;
        this.reviewService.reject(this.prescriptionId, notes).subscribe({
            next: () => {
                // 👇 استبدال الـ alert مع تأخير
                this.messageService.add({ severity: 'success', summary: 'مرفوض', detail: 'تم رفض الروشتة بنجاح.' });
                setTimeout(() => {
                    this.router.navigate(['/pharmacist/dashboard']);
                }, 1500);
            },
            error: (err) => {
                const errorMsg = err.error?.detail || err.error?.title || 'حدث خطأ أثناء الرفض.';
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: errorMsg });
            }
        });
    }

    onImageError(event: Event): void {
        const imgElement = event.target as HTMLImageElement;
        imgElement.src = 'https://placehold.co/600x400/eeeeee/31343c?text=Image+Blocked+or+Not+Found';
    }

    get isReadOnly(): boolean {
        return this.prescriptionData?.status !== 'PendingReview';
    }

    searchMedicines(event: any): void {
        const term = event.query;
        if (!term || term.trim().length < 2) {
            this.filteredMedicines = [];
            return;
        }

        this.reviewService.searchMedicines(term).subscribe({
            next: (data) => {
                this.filteredMedicines = data.map((item: any) => ({
                    ...item,
                    toString: function () {
                        return this.name || this.Name || this.brandName || 'اسم غير معروف';
                    }
                }));
            },
            error: (err) => {
                this.filteredMedicines = [];
            }
        });
    }

    onMedicineSelect(event: any, index: number): void {
        const medicineGroup = this.medicines.at(index) as FormGroup;
        const selectedItem = event.value || event;
        if (typeof selectedItem === 'string') return;
        const actualName = selectedItem.name || selectedItem.Name || selectedItem.brandName || selectedItem.genericName || 'اسم غير معروف';

        setTimeout(() => {
            medicineGroup.patchValue({
                medicineName: actualName,
                genericName: selectedItem.genericName || selectedItem.GenericName || '',
                strength: selectedItem.strength || selectedItem.Strength || '',
                dosageForm: selectedItem.dosageForm || selectedItem.DosageForm || '',
                route: selectedItem.route || selectedItem.Route || '',
                quantity: 1
            });
        }, 0);
    }
}