import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminOrdersService } from '@core/services/admin-orders.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// ── Local interfaces ────────────────────────────────────────────────────────
interface AdminOrderRow {
  orderId: string;
  orderNumber: string;
  patientName: string;
  primaryPharmacyName: string;
  medicineNames: string[];
  totalAmount: number;
  orderStatus: number;
  fulfillmentMode: number;
  createdAt: string;
  itemCount: number;
  legStatus?: number;
}

interface AdminOrderDetail {
  orderId: string;
  orderNumber: string;
  patientName: string;
  patientEmail: string;
  totalAmount: number;
  orderStatus: number;
  fulfillmentMode: number;
  createdAt: string;
  deliveredAt?: string;
  deliveryAddress: string;
  items: AdminOrderItem[];
  fulfillmentLegs: AdminOrderLeg[];
}

interface AdminOrderItem {
  orderItemId: string;
  drugName: string;
  genericName?: string;
  strength: string;
  dosageForm: string;
  quantityNeeded: number;
  unitPrice: number;
  lineTotal: number;
  itemStatus: number;
}

interface AdminOrderLeg {
  legId: string;
  legType: number;
  legStatus: number;
  pharmacyName: string;
  branchName: string;
  city: string;
  readyByEstimate: string;
  medicineNames: string[];
}

import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  private readonly svc = inject(AdminOrdersService);
  private readonly msg = inject(MessageService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInput$ = new Subject<string>();

  // ── Table state ──────────────────────────────────────────────────────────
  orders: AdminOrderRow[] = [];
  isLoading = false;
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }
  get hasPrev(): boolean {
    return this.pageNumber > 1;
  }
  get hasNext(): boolean {
    return this.pageNumber < this.totalPages;
  }
  get pagesArray(): number[] {
    const pages: number[] = [];
    for (
      let i = Math.max(1, this.pageNumber - 2);
      i <= Math.min(this.totalPages, this.pageNumber + 2);
      i++
    ) {
      pages.push(i);
    }
    return pages;
  }

  // ── Filters ──────────────────────────────────────────────────────────────
  searchTerm = '';
  selectedStatus: number | null = null;
  selectedMode: number | null = null;
  selectedLegStatus: number | null = null;
  fromDate = '';
  toDate = '';
  sortBy = 'date';
  sortDir = 'desc';

  // ── Export state ─────────────────────────────────────────────────────────
  isExporting = false;
  exportingFormat: 'xlsx' | 'csv' | null = null;

  // ── Order detail modal ───────────────────────────────────────────────────
  showDetailModal = false;
  detailLoading = false;
  selectedOrder: AdminOrderDetail | null = null;

  // ── Leg detail modal ─────────────────────────────────────────────────────
  showLegDetailModal = false;
  legDetailLoading = false;
  selectedLegDetail: any = null;

  // ── Update leg status modal ──────────────────────────────────────────────
  showUpdateLegModal = false;
  updatingLeg = false;
  updateLegId = '';
  updateLegNewStatus = 1;
  updateLegAuditReason = '';

  // ── Reference data ───────────────────────────────────────────────────────
  readonly statusOptions = [
    { value: null, label: 'كل حالات الطلب' },
    { value: 1, label: 'قيد الانتظار' },
    { value: 2, label: 'قيد المعالجة' },
    { value: 3, label: 'تم الشحن' },
    { value: 4, label: 'مكتمل' },
    { value: 5, label: 'ملغي' },
  ];

  readonly modeOptions = [
    { value: null, label: 'كل الأنواع' },
    { value: 1, label: 'توصيل' },
    { value: 2, label: 'استلام' },
  ];

  readonly legStatusOptions = [
    { value: null, label: 'كل حالات التوصيل' },
    { value: 1, label: 'تم القبول' },
    { value: 2, label: 'قيد التحضير' },
    { value: 3, label: 'جاهز للاستلام' },
    { value: 4, label: 'خرج للتوصيل' },
    { value: 5, label: 'تم التسليم' },
    { value: 6, label: 'ملغي' },
  ];

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Debounced async search — fires 400ms after user stops typing
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageNumber = 1;
        this.doLoad();
      });

    this.doLoad();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Load ─────────────────────────────────────────────────────────────────
  private buildFilter(): any {
    const f: any = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
    };
    if (this.searchTerm.trim()) f.search = this.searchTerm.trim();
    if (this.selectedStatus !== null) f.status = this.selectedStatus;
    if (this.selectedMode !== null) f.fulfillmentMode = this.selectedMode;
    if (this.selectedLegStatus !== null) f.legStatus = this.selectedLegStatus;
    if (this.fromDate) {
      const dFrom = new Date(this.fromDate);
      dFrom.setHours(0, 0, 0, 0);
      f.fromDate = dFrom.toISOString();
    }
    if (this.toDate) {
      const dTo = new Date(this.toDate);
      dTo.setHours(23, 59, 59, 999);
      f.toDate = dTo.toISOString();
    }
    return f;
  }

  doLoad(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.svc
      .getOrders(this.buildFilter())
      .pipe(
        catchError(() => {
          this.msg.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل الطلبات' });
          this.isLoading = false;
          this.cdr.markForCheck();
          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((res: any) => {
        this.orders = res.items ?? [];
        this.totalCount = res.totalCount ?? 0;
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  // ── Filter events ─────────────────────────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchInput$.next(value);
  }

  onFilterChange(): void {
    this.pageNumber = 1;
    this.doLoad();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedMode = null;
    this.selectedLegStatus = null;
    this.fromDate = '';
    this.toDate = '';
    this.sortBy = 'date';
    this.sortDir = 'desc';
    this.pageNumber = 1;
    this.doLoad();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.doLoad();
  }

  // ── Export ────────────────────────────────────────────────────────────────
  exportOrders(format: 'xlsx' | 'csv'): void {
    if (this.isExporting) return;
    this.isExporting = true;
    this.exportingFormat = format;
    this.cdr.markForCheck();

    const f: any = { sortBy: this.sortBy, sortDir: this.sortDir };
    if (this.searchTerm.trim()) f.search = this.searchTerm.trim();
    if (this.selectedStatus !== null) f.status = this.selectedStatus;
    if (this.selectedMode !== null) f.fulfillmentMode = this.selectedMode;
    if (this.selectedLegStatus !== null) f.legStatus = this.selectedLegStatus;
    if (this.fromDate) {
      const dFrom = new Date(this.fromDate);
      dFrom.setHours(0, 0, 0, 0);
      f.fromDate = dFrom.toISOString();
    }
    if (this.toDate) {
      const dTo = new Date(this.toDate);
      dTo.setHours(23, 59, 59, 999);
      f.toDate = dTo.toISOString();
    }

    this.svc
      .exportOrders(f, format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `orders-${Date.now()}.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          this.isExporting = false;
          this.exportingFormat = null;
          this.msg.add({
            severity: 'success',
            summary: 'تم التصدير بنجاح',
            detail: `تم تصدير ملف ${format.toUpperCase()} بنجاح.`,
            life: 4000,
          });
          this.cdr.markForCheck();
        },
        error: () => {
          this.isExporting = false;
          this.exportingFormat = null;
          this.msg.add({
            severity: 'error',
            summary: 'خطأ في التصدير',
            detail: `فشل تصدير ملف ${format.toUpperCase()}. يرجى المحاولة لاحقاً.`,
            life: 4000,
          });
          this.cdr.markForCheck();
        },
      });
  }

  // ── Order detail ──────────────────────────────────────────────────────────
  openDetail(orderId: string): void {
    if (!orderId) return;
    this.router.navigate(['/admin/orders', orderId]);
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedOrder = null;
  }

  // ── Leg detail ────────────────────────────────────────────────────────────
  openLegDetail(legId: string): void {
    this.showLegDetailModal = true;
    this.legDetailLoading = true;
    this.selectedLegDetail = null;
    this.cdr.markForCheck();

    this.svc
      .getLegDetail(legId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.selectedLegDetail = res;
          this.legDetailLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.legDetailLoading = false;
          this.showLegDetailModal = false;
          this.msg.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل تحميل تفاصيل جزء التوصيل',
          });
          this.cdr.markForCheck();
        },
      });
  }

  closeLegDetail(): void {
    this.showLegDetailModal = false;
    this.selectedLegDetail = null;
  }

  // ── Update leg status ─────────────────────────────────────────────────────
  openUpdateLegStatus(legId: string, currentStatus: any): void {
    this.updateLegId = legId;
    this.updateLegNewStatus = typeof currentStatus === 'number' ? currentStatus : 1;
    this.updateLegAuditReason = '';
    this.showUpdateLegModal = true;
    this.cdr.markForCheck();
  }

  closeUpdateLegModal(): void {
    this.showUpdateLegModal = false;
    this.updateLegId = '';
    this.updateLegAuditReason = '';
  }

  submitUpdateLegStatus(): void {
    if (!this.updateLegId || !this.updateLegAuditReason.trim()) return;
    this.updatingLeg = true;
    this.cdr.markForCheck();

    this.svc
      .updateLegStatus(this.updateLegId, this.updateLegNewStatus, this.updateLegAuditReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.updatingLeg = false;
          this.showUpdateLegModal = false;
          this.msg.add({
            severity: 'success',
            summary: 'تم التحديث',
            detail: 'تم تحديث حالة جزء التوصيل بنجاح',
            life: 4000,
          });
          this.doLoad();
          this.cdr.markForCheck();
        },
        error: () => {
          this.updatingLeg = false;
          this.msg.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحديث حالة جزء التوصيل' });
          this.cdr.markForCheck();
        },
      });
  }

  // ── Label/class helpers ───────────────────────────────────────────────────
  getOrderStatusLabel(s: any): string {
    if (s === null || s === undefined) return '—';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'قيد الانتظار', Pending: 'قيد الانتظار',
      '2': 'قيد المعالجة', Processing: 'قيد المعالجة',
      '3': 'تم الشحن', Shipped: 'تم الشحن',
      '4': 'مكتمل', Completed: 'مكتمل',
      '5': 'ملغي', Cancelled: 'ملغي',
    };
    return map[str] ?? str;
  }

  getOrderStatusClass(s: any): string {
    if (s === null || s === undefined) return 'status-badge badge-default';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'badge-pending', Pending: 'badge-pending',
      '2': 'badge-processing', Processing: 'badge-processing',
      '3': 'badge-shipped', Shipped: 'badge-shipped',
      '4': 'badge-completed', Completed: 'badge-completed',
      '5': 'badge-cancelled', Cancelled: 'badge-cancelled',
    };
    return `status-badge ${map[str] ?? 'badge-default'}`;
  }

  getLegStatusLabel(s: any): string {
    if (s === null || s === undefined || s === '') return 'غير مسند';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'تم القبول', Assigned: 'تم القبول',
      '2': 'قيد التحضير', Preparing: 'قيد التحضير',
      '3': 'جاهز للاستلام', ReadyForPickup: 'جاهز للاستلام',
      '4': 'خرج للتوصيل', OutForDelivery: 'خرج للتوصيل', PickedUpByCourier: 'خرج للتوصيل', InDelivery: 'خرج للتوصيل',
      '5': 'تم التسليم', Delivered: 'تم التسليم', Completed: 'تم التسليم',
      '6': 'ملغي', Cancelled: 'ملغي',
    };
    return map[str] ?? str;
  }

  getLegStatusClass(s: any): string {
    if (s === null || s === undefined || s === '') return 'status-badge badge-none';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'badge-leg-assigned', Assigned: 'badge-leg-assigned',
      '2': 'badge-leg-preparing', Preparing: 'badge-leg-preparing',
      '3': 'badge-leg-ready', ReadyForPickup: 'badge-leg-ready',
      '4': 'badge-leg-out', OutForDelivery: 'badge-leg-out', PickedUpByCourier: 'badge-leg-out', InDelivery: 'badge-leg-out',
      '5': 'badge-leg-delivered', Delivered: 'badge-leg-delivered', Completed: 'badge-leg-delivered',
      '6': 'badge-cancelled', Cancelled: 'badge-cancelled',
    };
    return `status-badge ${map[str] ?? 'badge-default'}`;
  }

  getModeLabel(m: any): string {
    if (m === null || m === undefined) return '—';
    const str = String(m).trim();
    if (str === '1' || str.toLowerCase() === 'delivery') return 'توصيل';
    if (str === '2' || str.toLowerCase() === 'pickup') return 'استلام';
    return str;
  }

  getModeClass(m: any): string {
    if (m === null || m === undefined) return 'status-badge badge-default';
    const str = String(m).trim();
    if (str === '1' || str.toLowerCase() === 'delivery') return 'status-badge badge-delivery';
    if (str === '2' || str.toLowerCase() === 'pickup') return 'status-badge badge-pickup';
    return 'status-badge badge-default';
  }

  getModeIcon(m: any): string {
    if (m === null || m === undefined) return 'pi pi-shopping-bag';
    const str = String(m).trim();
    if (str === '1' || str.toLowerCase() === 'delivery') return 'pi pi-truck';
    return 'pi pi-building';
  }

  getLegTypeLabel(t: any): string {
    const str = String(t).trim();
    return str === '1' || str.toLowerCase() === 'preparation' ? 'تحضير' : 'توصيل';
  }

  getItemStatusLabel(s: any): string {
    if (s === null || s === undefined) return '—';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'قيد الانتظار', Pending: 'قيد الانتظار',
      '2': 'تم التوفير', Fulfilled: 'تم التوفير', Completed: 'تم التوفير',
      '3': 'ملغي', Cancelled: 'ملغي',
      '4': 'تمت الإحالة', Awarded: 'تمت الإحالة',
      '5': 'غير متوفر', Unavailable: 'غير متوفر',
    };
    return map[str] ?? str;
  }

  getItemStatusClass(s: any): string {
    if (s === null || s === undefined) return 'status-badge badge-default';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'badge-pending', Pending: 'badge-pending',
      '2': 'badge-completed', Fulfilled: 'badge-completed', Completed: 'badge-completed',
      '3': 'badge-cancelled', Cancelled: 'badge-cancelled',
      '4': 'badge-shipped', Awarded: 'badge-shipped',
      '5': 'badge-item-unavailable', Unavailable: 'badge-item-unavailable',
    };
    return `status-badge ${map[str] ?? 'badge-default'}`;
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.selectedStatus !== null ||
      this.selectedMode !== null ||
      this.selectedLegStatus !== null ||
      this.fromDate ||
      this.toDate
    );
  }

  trackById(index: number, item: any): string {
    return item?.orderId ?? String(index);
  }
}
