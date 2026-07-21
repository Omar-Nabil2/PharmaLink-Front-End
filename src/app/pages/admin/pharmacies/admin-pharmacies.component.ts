import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { PharmacyService } from '@core/services/pharmacy.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { PharmacyItem, PagedPharmacyResponse } from '@core/interfaces/pharmacy.interface';
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

  // Pagination state
  pageNumber = 1;
  pageSize = 10;
  totalPages = 1;
  hasPreviousPage = false;
  hasNextPage = false;

  // Search/Inspection
  searchIdInput = '';
  inspectedPharmacy: PharmacyItem | null = null;
  isInspecting = false;

  constructor(
    private readonly pharmacyService: PharmacyService,
    private readonly errorHandlerService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadPharmacies();
  }

  loadPharmacies(): void {
    this.isLoading = true;
    this.pharmacyService.getPharmacies(this.pageNumber, this.pageSize).subscribe({
      next: (res: PagedPharmacyResponse) => {
        this.isLoading = false;
        this.pharmacies = res.items || [];
        this.pageNumber = res.pageNumber;
        this.totalPages = res.totalPages;
        this.hasPreviousPage = res.hasPreviousPage;
        this.hasNextPage = res.hasNextPage;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorHandlerService.handleError(err, 'فشل في تحميل الصيدليات');
      },
    });
  }

  onPageChange(newPage: number): void {
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
   * Fetch a single pharmacy by ID to test /inspect endpoint
   */
  fetchPharmacyById(id: string): void {
    if (!id.trim()) return;
    this.isInspecting = true;
    this.pharmacyService.getPharmacyById(id).subscribe({
      next: (data: PharmacyItem) => {
        this.isInspecting = false;
        this.inspectedPharmacy = data;
      },
      error: (err: HttpErrorResponse) => {
        this.isInspecting = false;
        this.inspectedPharmacy = null;
        // Uses global ErrorHandlerService (displays 404 Pharmacy.PharmacyNotFound cleanly)
        this.errorHandlerService.handleError(err, 'خطأ في جلب بيانات الصيدلية');
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Suspended':
      default:
        return 'bg-rose-50 text-rose-600 border-rose-200';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Verified':
        return 'نشطة';
      case 'Pending':
        return 'قيد الانتظار';
      case 'Suspended':
        return 'موقوفة';
      default:
        return status || 'غير محدد';
    }
  }
}
