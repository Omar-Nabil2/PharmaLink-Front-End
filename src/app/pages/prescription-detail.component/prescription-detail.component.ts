import { EnumTranslatePipe } from '@core/pipes/enum-translate.pipe';
import { Component, OnDestroy, OnInit, inject ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PrescriptionReviewService } from '@core/services/prescription-review.service';
import { MedicineDto } from '@core/interfaces/prescription-review.interface';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-patient-prescription-detail',
  standalone: true,
  imports: [EnumTranslatePipe, CommonModule, RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './prescription-detail.component.html' // أو ضع الـ HTML هنا إذا كان Inline
})
export class PatientPrescriptionDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reviewService = inject(PrescriptionReviewService);
  private messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  reviewId: string | null = null;
  reviewDetail: any = null;
  isLoading: boolean = false;
  hasError: boolean = false;
  isAddingToCart = false;
  selectedMedicineIds = new Set<string>();
  private pollingTimer: ReturnType<typeof setTimeout> | null = null;

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

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadReviewDetail(id: string): void {
    this.isLoading = true;
    this.hasError = false;

    this.reviewService.getReview(id).subscribe({
      next: (data) => {
        this.reviewDetail = data;
        this.selectedMedicineIds.clear();
        this.isLoading = false;
        this.schedulePollingIfNeeded();
        console.log('تفاصيل الروشتة:', data);
                this.cdr.markForCheck();

      },
      error: (err) => {
        this.hasError = true;
        this.isLoading = false;
        this.stopPolling();
        console.error('خطأ في جلب التفاصيل:', err);
      }
    });
  }

  private schedulePollingIfNeeded(): void {
    this.stopPolling();

    if (this.reviewDetail?.processingStatus === 'Processing' && this.reviewId) {
      this.pollingTimer = setTimeout(() => {
        if (this.reviewId) {
          this.loadReviewDetail(this.reviewId);
        }
      }, 3000);
    }
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
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

  getProcessingStatusLabel(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'processing':
        return 'جاري التحليل';
      case 'completed':
        return 'تم التحليل';
      case 'pendingpharmacistreview':
        return 'بانتظار الصيدلي';
      case 'needspatientapproval':
        return 'يحتاج موافقة المريض';
      case 'failed':
        return 'فشل التحليل';
      case 'rejected':
        return 'مرفوض';
      default:
        return status || '';
    }
  }

  getMedicineStatusLabel(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'exactmatch':
        return 'مطابقة مباشرة';
      case 'fuzzymatch':
        return 'مطابقة محتملة';
      case 'alternativesuggested':
        return 'بديل مقترح';
      case 'notfound':
        return 'غير موجود';
      default:
        return status || 'غير محدد';
    }
  }

  getMedicineStatusClass(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'exactmatch':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'fuzzymatch':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'alternativesuggested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'notfound':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  canSelectMedicine(med: MedicineDto): boolean {
    const status = (med.matchStatus || '').toLowerCase();
    return this.reviewDetail?.status === 'Approved'
      && !!med.id
      && ['exactmatch', 'fuzzymatch', 'alternativesuggested'].includes(status);
  }

  toggleMedicine(med: MedicineDto, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (!med.id || !this.canSelectMedicine(med)) return;

    if (checked) {
      this.selectedMedicineIds.add(med.id);
    } else {
      this.selectedMedicineIds.delete(med.id);
    }
  }

  isSelected(med: MedicineDto): boolean {
    return !!med.id && this.selectedMedicineIds.has(med.id);
  }

  addSelectedToCart(): void {
    if (!this.reviewId || this.selectedMedicineIds.size === 0 || this.isAddingToCart) return;

    this.isAddingToCart = true;
    this.reviewService.addSelectedMedicinesToCart(this.reviewId, Array.from(this.selectedMedicineIds)).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم إضافة الأدوية المختارة للكارت.' });
        this.router.navigate(['/patient/cart']);
      },
      error: (err) => {
        this.isAddingToCart = false;
        const detail = err?.error?.detail || err?.error?.message || 'تعذر إضافة الأدوية المختارة للكارت.';
        this.messageService.add({ severity: 'error', summary: 'لم تتم الإضافة', detail });
      }
    });
  }
}
