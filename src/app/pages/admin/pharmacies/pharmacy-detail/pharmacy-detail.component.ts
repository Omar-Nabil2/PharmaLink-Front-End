import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { AdminPharmacyService } from '@core/services/admin-pharmacy.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import {
  AdminPharmacyDetailDto,
  AdminPharmacyBranchDto,
  VerificationStatus,
} from '@core/interfaces/admin-pharmacy.interface';

@Component({
  selector: 'app-pharmacy-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './pharmacy-detail.component.html',
  styleUrl: './pharmacy-detail.component.scss',
})
export class PharmacyDetailComponent implements OnInit {
  private readonly service = inject(AdminPharmacyService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  pharmacy: AdminPharmacyDetailDto | null = null;
  isLoading = true;
  errorMsg: string | null = null;

  readonly VerificationStatus = VerificationStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/admin/pharmacies']);
      return;
    }
    this.loadPharmacy(id);
  }

  private loadPharmacy(id: string): void {
    this.isLoading = true;
    this.errorMsg = null;
    this.cdr.markForCheck();

    this.service.getPharmacyById(id).subscribe({
      next: (data) => {
        this.pharmacy = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        const status = err?.status;
        if (status === 404) {
          this.errorMsg = 'لم يتم العثور على الصيدلية المطلوبة.';
        } else if (status === 403) {
          this.errorMsg = 'ليس لديك صلاحية لعرض هذه الصيدلية.';
        } else {
          this.errorMsg = 'حدث خطأ أثناء تحميل بيانات الصيدلية. يرجى المحاولة مرة أخرى.';
          this.errorHandler.handleError(err, 'فشل في تحميل بيانات الصيدلية');
        }
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/pharmacies']);
  }

  // ─── Status helpers (same robust normalization as list) ───────────────────────
  private normalizeStatus(status: any): VerificationStatus | null {
    const n = Number(status);
    if (!isNaN(n) && n >= 1 && n <= 4) return n as VerificationStatus;
    const s = String(status).toLowerCase();
    if (s === 'pending')  return VerificationStatus.Pending;
    if (s === 'verified') return VerificationStatus.Verified;
    if (s === 'rejected') return VerificationStatus.Rejected;
    if (s === 'deleted')  return VerificationStatus.Deleted;
    return null;
  }

  getStatusLabel(status: any): string {
    switch (this.normalizeStatus(status)) {
      case VerificationStatus.Pending:   return 'قيد الانتظار';
      case VerificationStatus.Verified:  return 'موثقة';
      case VerificationStatus.Rejected:  return 'مرفوضة';
      case VerificationStatus.Deleted:   return 'محذوفة';
      default:                           return 'غير محدد';
    }
  }

  getStatusClass(status: any): string {
    switch (this.normalizeStatus(status)) {
      case VerificationStatus.Verified:  return 'status-verified';
      case VerificationStatus.Pending:   return 'status-pending';
      case VerificationStatus.Rejected:  return 'status-rejected';
      case VerificationStatus.Deleted:   return 'status-deleted';
      default:                           return 'status-default';
    }
  }

  /** Resolves absolute logo URL using environment.localUrl server host */
  getLogoUrl(logoUrl?: string | null): string {
    if (!logoUrl) return '';
    if (
      logoUrl.startsWith('http://') ||
      logoUrl.startsWith('https://') ||
      logoUrl.startsWith('data:') ||
      logoUrl.startsWith('blob:')
    ) {
      return logoUrl;
    }
    const host = environment.localUrl.replace(/\/api\/v1\/?$/, '');
    const path = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
    return `${host}${path}`;
  }

  trackByBranchId(_: number, branch: AdminPharmacyBranchDto): string {
    return branch.branchId;
  }
}
