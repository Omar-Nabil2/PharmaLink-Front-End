import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PrescriptionReviewService } from '../../../core/services/prescription-review.service';
import { PrescriptionReviewDto } from '../../../core/interfaces/prescription-review.interface';
import { ChangeDetectorRef } from '@angular/core';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
    selector: 'app-review-prescription',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, AutoCompleteModule],
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
        private readonly cdr: ChangeDetectorRef
    ) {
        // تعريف الفورم الأساسية
        this.reviewForm = this.fb.group({
            notes: [''],
            medicines: this.fb.array([]) // مصفوفة الأدوية علشان نقدر نضيف ونمسح براحتنا
        });
    }

    ngOnInit(): void {
        // التقاط الـ ID من الرابط
        this.prescriptionId = this.route.snapshot.paramMap.get('id') || '';
        if (this.prescriptionId) {
            this.loadPrescription();
        }

    }

    // Helper method علشان نوصل للـ FormArray في الـ HTML بسهولة
    get medicines(): FormArray {
        return this.reviewForm.get('medicines') as FormArray;
    }

    loadPrescription(): void {
        this.reviewService.getReview(this.prescriptionId).subscribe({
            next: (data) => {
                // الحل الشامل لمشكلة رابط الصورة
                if (data.imageUrl) {
                    const lastHttpIndex = data.imageUrl.lastIndexOf('http');

                    // الحالة الأولى: لو اللينك فيه تكرار لـ http (المشكلة القديمة)
                    if (lastHttpIndex > 0) {
                        data.imageUrl = data.imageUrl.substring(lastHttpIndex);
                    }
                    // الحالة التانية: لو اللينك مسار نسبي (مش بيبدأ بـ http أصلاً)
                    else if (!data.imageUrl.startsWith('http')) {
                        // بنزود الـ Base URL بتاع السيرفر
                        const prefix = data.imageUrl.startsWith('/') ? '' : '/';
                        data.imageUrl = 'https://pharmalink.tryasp.net' + prefix + data.imageUrl;
                    }
                }

                // سطر مؤقت علشان نطبع اللينك النهائي في الكونسول ونشوف شكله إيه
                console.log('صورة الروشتة النهائية:', data.imageUrl);

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
        console.log('--- 🚀 محاولة الحفظ بدأت ---');
        console.log('حالة الفورم:', this.reviewForm.valid ? 'سليمة ✅' : 'فيها مشكلة ❌');

        // 1. لو الفورم فيها مشكلة (مثلاً دواء متساب فاضي) نوقف الحفظ
        if (this.reviewForm.invalid) {
            alert('برجاء التأكد من إدخال اسم الدواء والكمية لجميع الأدوية (لا تترك سطراً فارغاً).');
            return;
        }

        const formMedicines = this.reviewForm.value.medicines;

        // 2. تجهيز الـ Payload ليتطابق مع الـ DTO في الباك-إند
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

        console.log('📦 الداتا اللي رايحة للباك-إند:', updatePayload);

        // 3. إرسال الطلب للسيرفر
        this.reviewService.updateReview(this.prescriptionId, updatePayload).subscribe({
            next: (updatedData) => {
                console.log('✅ رد السيرفر بعد الحفظ:', updatedData);
                alert('تم حفظ الأدوية والجرعات بنجاح!');

                // تحديث الـ IDs للأدوية علشان لو ضفنا دواء جديد ياخد الـ Guid بتاعه
                if (updatedData && updatedData.medicines) {
                    this.medicines.clear();
                    updatedData.medicines.forEach((med: any) => this.addMedicine(med));

                    // السطر ده مهم جداااا علشان الشاشة ترسم الداتا الجديدة
                    this.cdr.detectChanges();
                }
            },
            error: (err) => {
                console.error('❌ إيرور السيرفر:', err);
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

                alert('فشل الحفظ:\n' + errorMsg);
            }
        });
    }
    onApprove(): void {
        // 1. لو الفورم فيها مشكلة نوقف العملية
        if (this.reviewForm.invalid) {
            alert('برجاء إدخال جميع البيانات المطلوبة لجميع الأدوية.');
            return;
        }

        const formMedicines = this.reviewForm.value.medicines;
        const notes = this.reviewForm.value.notes;

        // 2. نجهز داتا الأدوية الجديدة علشان تتبعت
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
        // 3. نبعت طلب الـ Update للسيرفر الأول
        this.reviewService.updateReview(this.prescriptionId, updatePayload).subscribe({
            next: () => {
                // 4. لو الأدوية اتحفظت بنجاح، نبعت طلب الموافقة فوراً
                this.reviewService.approve(this.prescriptionId, notes).subscribe({
                    next: () => {
                        alert('تم حفظ الأدوية والموافقة على الروشتة بنجاح!');
                        this.router.navigate(['/prescriptions']); // نخرج بره الصفحة
                    },
                    error: (err) => {
                        console.error('Approve Error:', err);
                        alert('تم حفظ الأدوية، لكن السيرفر رفض الموافقة.');
                    }
                });
            },
            error: (err) => {
                console.error('Update Error:', err);
                alert('فشل حفظ الأدوية، لذلك لم يتم إرسال طلب الموافقة.');
            }
        });
    }
    onReject(): void {
        const notes = this.reviewForm.value.notes;
        this.reviewService.reject(this.prescriptionId, notes).subscribe({
            next: () => {
                alert('تم رفض الروشتة بنجاح.');
                this.router.navigate(['/prescriptions']);
            },
            error: (err) => {
                const errorMsg = err.error?.detail || err.error?.title || 'حدث خطأ أثناء الرفض.';
                alert('فشل الرفض: ' + errorMsg);
                console.error(err);
            }
        });
    }

    onImageError(event: Event): void {
        const imgElement = event.target as HTMLImageElement;
        // هنحط رابط لصورة بديلة شغالة ومفيهاش حماية معقدة
        imgElement.src = 'https://placehold.co/600x400/eeeeee/31343c?text=Image+Blocked+or+Not+Found';
        // ممكن مستقبلاً تحط مسار صورة عندك في المشروع زي: 'assets/images/fallback.png'
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
                // التريكة العبقرية: بنعيد تعريف الـ toString علشان لو PrimeNG حاولت تعرض الأوبجكت
                // بدل ما تقول [object Object]، هتقرأ اسم الدواء فوراً
                this.filteredMedicines = data.map((item: any) => ({
                    ...item,
                    toString: function () {
                        return this.name || this.Name || this.brandName || 'اسم غير معروف';
                    }
                }));
            },
            error: (err) => {
                console.error('Error searching medicines:', err);
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
                // بنبعت الاسم كنص صريح (String)
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