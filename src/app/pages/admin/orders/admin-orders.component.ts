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

@Component({
  selector: 'app-admin-orders-v2',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
})
export class AdminOrdersV2Component implements OnInit, OnDestroy {
  private readonly svc = inject(AdminOrdersService);
  private readonly msg = inject(MessageService);
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
  fromDate = '';
  toDate = '';
  sortBy = 'date';
  sortDir = 'desc';

  // ── Export state ─────────────────────────────────────────────────────────
  isExporting = false;

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
    { value: null, label: 'كل الحالات' },
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
    if (this.fromDate) f.fromDate = new Date(this.fromDate).toISOString();
    if (this.toDate) f.toDate = new Date(this.toDate).toISOString();
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
    this.cdr.markForCheck();

    const f: any = { sortBy: this.sortBy, sortDir: this.sortDir };
    if (this.searchTerm.trim()) f.search = this.searchTerm.trim();
    if (this.selectedStatus !== null) f.status = this.selectedStatus;
    if (this.fromDate) f.fromDate = new Date(this.fromDate).toISOString();
    if (this.toDate) f.toDate = new Date(this.toDate).toISOString();

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
          this.msg.add({
            severity: 'success',
            summary: 'نجاح',
            detail: `تم تصدير ${format.toUpperCase()} بنجاح`,
          });
          this.cdr.markForCheck();
        },
        error: () => {
          this.isExporting = false;
          this.msg.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تصدير الطلبات' });
          this.cdr.markForCheck();
        },
      });
  }

  // ── Order detail ──────────────────────────────────────────────────────────
  openDetail(orderId: string): void {
    this.showDetailModal = true;
    this.detailLoading = true;
    this.selectedOrder = null;
    this.cdr.markForCheck();

    this.svc
      .getOrderDetails(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.selectedOrder = res;
          this.detailLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.detailLoading = false;
          this.showDetailModal = false;
          this.msg.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل تفاصيل الطلب' });
          this.cdr.markForCheck();
        },
      });
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
  openUpdateLegStatus(legId: string, currentStatus: number): void {
    this.updateLegId = legId;
    this.updateLegNewStatus = Number(currentStatus);
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
            summary: 'نجاح',
            detail: 'تم تحديث حالة جزء التوصيل',
          });
          // Refresh detail view and table
          if (this.selectedOrder) this.openDetail(this.selectedOrder.orderId);
          this.doLoad();
          this.cdr.markForCheck();
        },
        error: () => {
          this.updatingLeg = false;
          this.msg.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحديث الحالة' });
          this.cdr.markForCheck();
        },
      });
  }

  // ── Label/class helpers ───────────────────────────────────────────────────
  getOrderStatusLabel(s: any): string {
    const map: Record<number, string> = {
      1: 'قيد الانتظار',
      2: 'قيد المعالجة',
      3: 'تم الشحن',
      4: 'مكتمل',
      5: 'ملغي',
    };
    return map[Number(s)] ?? '—';
  }

  getOrderStatusClass(s: any): string {
    const map: Record<number, string> = {
      1: 'badge-pending',
      2: 'badge-processing',
      3: 'badge-shipped',
      4: 'badge-completed',
      5: 'badge-cancelled',
    };
    return `status-badge ${map[Number(s)] ?? 'badge-default'}`;
  }

  getLegStatusLabel(s: any): string {
    if (!s) return 'غير مسند';
    const map: Record<number, string> = {
      1: 'تم القبول',
      2: 'قيد التحضير',
      3: 'جاهز للاستلام',
      4: 'خرج للتوصيل',
      5: 'تم التسليم',
      6: 'ملغي',
    };
    return map[Number(s)] ?? '—';
  }

  getLegStatusClass(s: any): string {
    if (!s) return 'status-badge badge-none';
    const map: Record<number, string> = {
      1: 'badge-leg-assigned',
      2: 'badge-leg-preparing',
      3: 'badge-leg-ready',
      4: 'badge-leg-out',
      5: 'badge-leg-delivered',
      6: 'badge-cancelled',
    };
    return `status-badge ${map[Number(s)] ?? 'badge-default'}`;
  }

  getModeLabel(m: any): string {
    return Number(m) === 1 ? 'توصيل' : 'استلام';
  }

  getModeClass(m: any): string {
    return Number(m) === 1 ? 'status-badge badge-delivery' : 'status-badge badge-pickup';
  }

  getModeIcon(m: any): string {
    return Number(m) === 1 ? 'pi pi-truck' : 'pi pi-building';
  }

  getLegTypeLabel(t: any): string {
    return Number(t) === 1 ? 'تحضير' : 'توصيل';
  }

  getItemStatusLabel(s: any): string {
    const map: Record<number, string> = {
      1: 'قيد الانتظار',
      2: 'تم التوفير',
      3: 'ملغي',
      4: 'تمت الإحالة',
      5: 'غير متوفر',
    };
    return map[Number(s)] ?? '—';
  }

  getItemStatusClass(s: any): string {
    const map: Record<number, string> = {
      1: 'badge-pending',
      2: 'badge-completed',
      3: 'badge-cancelled',
      4: 'badge-shipped',
      5: 'badge-cancelled',
    };
    return `status-badge ${map[Number(s)] ?? 'badge-default'}`;
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.selectedStatus !== null ||
      this.selectedMode !== null ||
      this.fromDate ||
      this.toDate
    );
  }

  trackById(index: number, item: any): string {
    return item?.orderId ?? String(index);
  }
}
