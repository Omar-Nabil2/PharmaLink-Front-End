import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrescriptionReviewService } from '@core/services/prescription-review.service';
import { GetAllPrescriptionReviewDto } from '@core/interfaces/prescription-review.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-patient-prescriptions-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-prescription-review.component.html'
})
export class PatientPrescriptionsListComponent implements OnInit {
  private readonly reviewService = inject(PrescriptionReviewService);
  private readonly cdr = inject(ChangeDetectorRef);

  prescriptions: GetAllPrescriptionReviewDto[] = [];
  isLoading = true;
  hasError = false;

  // إعدادات الصفحات
  currentPage = 1;
  pageSize = 9; // 9 كروت في الصفحة لتناسب الشاشات (3x3)
  totalPages = 1;
  totalCount = 0;

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(page: number = 1): void {
    this.isLoading = true;
    this.hasError = false;
    this.currentPage = page;

    this.reviewService.getAllPrescriptionReview({
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        console.log('تم جلب قائمة الروشتات بنجاح:', response);
        this.prescriptions = response.items || [];
        this.totalPages = response.totalPages || 1;
        // this.totalCount = response.totalCount|| 0;
        this.isLoading = false;

        // إجبار التحديث لتجنب تعليق التحميل
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('حدث خطأ أثناء تحميل الروشتات:', err);
        this.isLoading = false;
        this.hasError = true;
        this.cdr.markForCheck();
      }
    });
  }

  // تغيير الصفحة
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.loadPrescriptions(page);
    }
  }

  // الحصول على رابط الصورة كاملاً
  getImageUrl(imageUrl?: string): string {
    if (!imageUrl) return 'assets/images/prescription-placeholder.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // إزالة /api/v1 إذا كانت الصورة في root server
    const serverUrl = environment.baseUrl.replace('/api/v1', '');
    return `${serverUrl}/${imageUrl.replace(/^\//, '')}`;
  }

  // تنسيق حالة الروشتة (Colors)
  getStatusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }

  // نص حالة الروشتة بالعربية
  getStatusLabel(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'تمت الموافقة';
      case 'rejected':
        return 'تم الرفض';
      default:
        return 'قيد المراجعة';
    }
  }
}