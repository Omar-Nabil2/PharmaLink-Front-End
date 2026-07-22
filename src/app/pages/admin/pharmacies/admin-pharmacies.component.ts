import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { PharmacyService } from '@core/services/pharmacy.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { PharmacyItem, PagedPharmacyResponse, VerificationStatus } from '@core/interfaces/pharmacy.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-pharmacies',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, CardModule],
  templateUrl: './admin-pharmacies.component.html',
  styleUrl: './admin-pharmacies.component.scss',
})
export class AdminPharmaciesComponent implements OnInit {
  pharmacies: PharmacyItem[] = [];
  isLoading = false;

  // Pagination state bound to API response
  pageNumber = 1;
  pageSize = 10;
  totalPages = 1;
  hasPreviousPage = false;
  hasNextPage = false;

  // Single Pharmacy lookup / inspection
  inspectedPharmacy: PharmacyItem | null = null;
  isInspecting = false;

  constructor(
    private readonly pharmacyService: PharmacyService,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('[AdminPharmaciesComponent] Initialized. Loading pharmacies...');
    this.loadPharmacies();
  }

  /**
   * Fetches paginated pharmacies list from GET /api/v1/Pharmacies?PageNumber=X&PageSize=Y
   */
  loadPharmacies(): void {
    this.isLoading = true;
    console.log(`[AdminPharmaciesComponent] Calling getPharmacies(pageNumber: ${this.pageNumber}, pageSize: ${this.pageSize})`);

    this.pharmacyService.getPharmacies(this.pageNumber, this.pageSize).subscribe({
      next: (res: any) => {
        console.log('[AdminPharmaciesComponent] Received successful response:', res);
        try {
          // Support both { items: [...] } response wrapper AND direct array [...] response
          let itemsList: PharmacyItem[] = [];
          if (Array.isArray(res)) {
            itemsList = res;
          } else if (res && Array.isArray(res.items)) {
            itemsList = res.items;
          } else if (res && res.data && Array.isArray(res.data)) {
            itemsList = res.data;
          }

          console.log('[AdminPharmaciesComponent] Parsed items count:', itemsList.length);
          this.pharmacies = itemsList;

          this.pageNumber = res?.pageNumber ?? this.pageNumber;
          this.totalPages = res?.totalPages ?? (itemsList.length > 0 ? 1 : 1);
          this.hasPreviousPage = res?.hasPreviousPage ?? (this.pageNumber > 1);
          this.hasNextPage = res?.hasNextPage ?? (this.pageNumber < this.totalPages);
        } catch (parseErr) {
          console.error('[AdminPharmaciesComponent] Error processing response:', parseErr);
        } finally {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('[AdminPharmaciesComponent] Failed to load pharmacies.');
        console.error('[AdminPharmaciesComponent] Status Code:', err?.status);
        console.error('[AdminPharmaciesComponent] Error Payload:', err?.error);

        // Delegates error parsing and toast display to global ErrorHandlerService
        this.errorHandlerService.handleError(err, 'فشل في تحميل قائمة الصيدليات');
      },
    });
  }

  /**
   * Pagination page change handler
   */
  onPageChange(newPage: number): void {
    console.log(`[AdminPharmaciesComponent] Changing page to: ${newPage}`);
    if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.pageNumber) {
      this.pageNumber = newPage;
      this.loadPharmacies();
    }
  }

  get pagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Fetches single pharmacy details by ID via GET /api/v1/Pharmacies/{id}
   */
  fetchPharmacyById(id: string): void {
    if (!id || !id.trim()) return;
    this.isInspecting = true;
    console.log(`[AdminPharmaciesComponent] Fetching single pharmacy by ID: ${id}`);

    this.pharmacyService.getPharmacyById(id).subscribe({
      next: (data: PharmacyItem) => {
        this.isInspecting = false;
        console.log('[AdminPharmaciesComponent] Single pharmacy payload:', data);
        this.inspectedPharmacy = data;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isInspecting = false;
        this.inspectedPharmacy = null;
        this.cdr.detectChanges();
        console.error('[AdminPharmaciesComponent] Failed to fetch single pharmacy by ID:', id);

        // Handles 404 Pharmacy.PharmacyNotFound cleanly via global ErrorHandlerService
        this.errorHandlerService.handleError(err, 'خطأ في جلب بيانات الصيدلية');
      },
    });
  }

  /**
   * Resolves badge color classes based on string or byte enum status
   */
  getStatusBadgeClass(status: VerificationStatus | string | number): string {
    const s = String(status);
    if (s === 'Verified' || s === '2') {
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    }
    if (s === 'Pending' || s === '1') {
      return 'bg-amber-50 text-amber-600 border-amber-200';
    }
    if (s === 'Rejected' || s === '3' || s === 'Suspended') {
      return 'bg-rose-50 text-rose-600 border-rose-200';
    }
    return 'bg-slate-50 text-slate-600 border-slate-200';
  }

  /**
   * Resolves human Arabic label for status
   */
  getStatusLabel(status: VerificationStatus | string | number): string {
    const s = String(status);
    if (s === 'Verified' || s === '2') {
      return 'نشطة';
    }
    if (s === 'Pending' || s === '1') {
      return 'قيد الانتظار';
    }
    if (s === 'Rejected' || s === '3') {
      return 'مرفوضة';
    }
    if (s === 'Suspended') {
      return 'موقوفة';
    }
    return status != null ? String(status) : 'غير محدد';
  }
}
