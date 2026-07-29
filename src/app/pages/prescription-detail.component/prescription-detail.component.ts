import { Component, OnInit, inject ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PrescriptionReviewService } from '@core/services/prescription-review.service';

@Component({
  selector: 'app-patient-prescription-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prescription-detail.component.html' // أو ضع الـ HTML هنا إذا كان Inline
})
export class PatientPrescriptionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reviewService = inject(PrescriptionReviewService);
  private readonly cdr = inject(ChangeDetectorRef);

  reviewId: string | null = null;
  reviewDetail: any = null;
  isLoading: boolean = false;
  hasError: boolean = false;

  ngOnInit(): void {
    // التقاط الـ id من الـ URL
    this.route.paramMap.subscribe(params => {
      this.reviewId = params.get('id');
      if (this.reviewId) {
        this.loadReviewDetail(this.reviewId);
                this.cdr.markForCheck();

      }
    });
  }

  loadReviewDetail(id: string): void {
    this.isLoading = true;
    this.hasError = false;

    this.reviewService.getReview(id).subscribe({
      next: (data) => {
        this.reviewDetail = data;
        this.isLoading = false;
        console.log('تفاصيل الروشتة:', data);
                this.cdr.markForCheck();

      },
      error: (err) => {
        this.hasError = true;
        this.isLoading = false;
        console.error('خطأ في جلب التفاصيل:', err);
      }
    });
  }

  // 🎨 دوال لتنسيق وعرض حالة الروشتة بشكل جمالي
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'مقبول':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
      case 'مرفوض':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200'; // قيد المراجعة
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
      default:
        return 'قيد المراجعة';
    }
  }
}