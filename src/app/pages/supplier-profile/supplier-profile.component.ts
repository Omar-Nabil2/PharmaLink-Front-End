import { ChangeDetectionStrategy, Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SupplierFeaturesService } from '../../core/services/supplier-features.service';

@Component({
    selector: 'app-supplier-profile',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule, ToastModule],
    providers: [MessageService],
    templateUrl: './supplier-profile.component.html'
})
export class SupplierProfileComponent {
    private readonly featuresService = inject(SupplierFeaturesService);
    private readonly messageService = inject(MessageService);

    // ─── جلب بيانات الملف الشخصي ───
    readonly profileResource = rxResource({
        stream: () => this.featuresService.getProfile()
    });

    readonly isLoading = computed(() => this.profileResource.isLoading());

    // المتغيرات اللي هتتربط بالفورم
    readonly formData = signal({
        fullName: '',
        phoneNumber: '',
        address: '',
        contactPerson: ''
    });

    // أول ما الداتا تيجي، بنعبي الفورم
    constructor() {
        effect(() => {
            // بنقرأ قيمة الـ Signal عن طريق استدعائه كدالة ()
            const data = this.profileResource.value();

            if (data) {
                this.formData.set({
                    fullName: data.fullName || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '',
                    contactPerson: data.contactPerson || ''
                });
            }
        });
    }

    readonly isSaving = signal(false);

    saveProfile(): void {
        this.isSaving.set(true);
        this.featuresService.updateProfile(this.formData()).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'تم', detail: res.message });
                this.isSaving.set(false);
                this.profileResource.reload(); // عشان نحدث الداتا
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحديث البيانات' });
                this.isSaving.set(false);
            }
        });
    }
}