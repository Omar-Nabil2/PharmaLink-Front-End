import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PrescriptionReviewService } from '@core/services/prescription-review.service';
import { PrescriptionReviewDto } from '@core/interfaces/prescription-review.interface';

@Component({
  selector: 'app-prescription-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prescription-detail.component.html'
})
export class PatientPrescriptionReviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reviewService = inject(PrescriptionReviewService);
  private readonly cdr = inject(ChangeDetectorRef);

  reviewDetail: PrescriptionReviewDto | null = null;
  isLoading = true;
  hasError = false;
  reviewId: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.reviewId = params.get('id');
      if (this.reviewId) {
        this.loadReviewDetail(this.reviewId);
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
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('خطأ في تحميل تفاصيل الروشتة:', err);
        this.isLoading = false;
        this.hasError = true;
        this.cdr.markForCheck();
      }
    });
  }

  getStatusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'تمت الموافقة';
      case 'rejected': return 'تم الرفض';
      default: return 'قيد المراجعة';
    }
  }
}