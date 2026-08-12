import { EnumTranslatePipe } from '@core/pipes/enum-translate.pipe';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { PharmacyOrdersService } from '@core/services/pharmacy-orders.service';
import { SearchService } from '@core/services/search.service';
import { PharmacyBranchSearchDTO } from '@pages/inventory/search.model';
import {
  FulfillmentMode,
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_FILTER_OPTIONS,
  OrderStatus,
  LegStatus,
  PharmacyOrderDetailDTO,
  PharmacyOrderQueryParams,
  PharmacyOrderSort,
  PharmacyOrderSummaryDTO,
  ProblemDetails,
  getFulfillmentModeClasses,
  getFulfillmentModeLabel,
  getLegStatusClasses,
  getLegStatusLabel,
  getLegTypeLabel,
  getOrderStatusPresentation,
} from './pharmacy-orders.model';

/** Sentinel representing the "all branches" selection. */
const ALL_BRANCHES = 'ALL';

@Component({
  selector: 'app-pharmacy-orders',
  standalone: true,
  imports: [EnumTranslatePipe, 
    DatePipe,
    DecimalPipe,
    NgClass,
    FormsModule,
    TableModule,
    DialogModule,
    SelectModule,
    ToastModule,
    AutoCompleteModule,
  ],
  providers: [MessageService],
  templateUrl: './pharmacy-orders.component.html',
  styleUrl: './pharmacy-orders.component.scss',
})
export class PharmacyOrdersComponent implements OnInit {
  private readonly ordersService = inject(PharmacyOrdersService);
  private readonly searchService = inject(SearchService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // ── List / paging state ─────────────────────────────────────
  readonly orders = signal<PharmacyOrderSummaryDTO[]>([]);
  readonly totalRecords = signal(0);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // ── Filter state ────────────────────────────────────────────
  readonly searchQuery = signal('');
  readonly selectedStatus = signal<LegStatus | null>(null);
  readonly orderDateFrom = signal<string>('');
  readonly orderDateTo = signal<string>('');
  readonly sortBy = signal<PharmacyOrderSort>(PharmacyOrderSort.NewestFirst);
  readonly branchId = signal<string | null>(null);

  readonly pageNumber = signal(1);
  readonly pageSize = signal(10);
  readonly first = signal(0);

  readonly statusOptions = ORDER_STATUS_FILTER_OPTIONS;
  readonly sortOptions = ORDER_SORT_OPTIONS;
  readonly pageSizeOptions = [10, 25, 50];

  readonly isEmpty = computed(
    () => !this.isLoading() && !this.errorMessage() && this.orders().length === 0,
  );

  /** Total pages for the compact pagination bar. */
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalRecords() / this.pageSize())),
  );

  /** Whether the "all branches" list view is active. */
  readonly isAllBranchesView = computed(() => !this.branchId());

  // ── Detail modal state ──────────────────────────────────────
  readonly isDetailDialogOpen = signal(false);
  readonly isDetailLoading = signal(false);
  readonly orderDetail = signal<PharmacyOrderDetailDTO | null>(null);

  // ── Branch filter (toolbar) autocomplete ────────────────────
  readonly branchFilterSuggestions = signal<PharmacyBranchSearchDTO[]>([]);
  readonly selectedBranchFilter = signal<PharmacyBranchSearchDTO | null>(null);

  private readonly searchInput$ = new Subject<string>();
  private readonly branchFilterQuery$ = new Subject<string>();

  // Expose helpers / enums to the template.
  protected readonly OrderStatus = OrderStatus;
  protected readonly LegStatus = LegStatus;
  protected readonly PharmacyOrderSort = PharmacyOrderSort;
  protected readonly FulfillmentMode = FulfillmentMode;
  protected readonly getOrderStatusPresentation = getOrderStatusPresentation;
  protected readonly getFulfillmentModeLabel = getFulfillmentModeLabel;
  protected readonly getFulfillmentModeClasses = getFulfillmentModeClasses;
  protected readonly getLegStatusLabel = getLegStatusLabel;
  protected readonly getLegStatusClasses = getLegStatusClasses;
  protected readonly getLegTypeLabel = getLegTypeLabel;

  ngOnInit(): void {
    // Debounced live search: only refetch after the user pauses typing.
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.searchQuery.set(value);
        this.resetToFirstPage();
        this.loadOrders();
      });

    // Branch filter autocomplete stream.
    this.branchFilterQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.searchService.searchBranches(term ?? '')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => this.branchFilterSuggestions.set(results ?? []));

    this.loadOrders();
  }

  // ── Data loading ────────────────────────────────────────────
  loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const params: PharmacyOrderQueryParams = {
      search: this.searchQuery().trim() || null,
      status: this.selectedStatus(),
      orderDateFrom: this.toIsoStart(this.orderDateFrom()),
      orderDateTo: this.toIsoEnd(this.orderDateTo()),
      sortBy: this.sortBy(),
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };

    const branchId = this.branchId();
    const request$ =
      branchId && branchId !== ALL_BRANCHES
        ? this.ordersService.getOrdersByBranch(branchId, params)
        : this.ordersService.getOrders(params);

    request$.subscribe({
      next: (res) => {
        this.orders.set(res.items ?? []);
        this.totalRecords.set(res.totalCount ?? res.items?.length ?? 0);
        this.isLoading.set(false);
      },
      error: (problem: ProblemDetails) => {
        this.orders.set([]);
        this.totalRecords.set(0);
        this.errorMessage.set(
          problem.detail ?? problem.title ?? 'تعذر تحميل الطلبات. حاول مرة أخرى.',
        );
        this.isLoading.set(false);
      },
    });
  }

  reload(): void {
    this.loadOrders();
  }

  // ── Filter / search handlers ────────────────────────────────
  onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  onStatusChange(value: LegStatus | null): void {
    this.selectedStatus.set(value ?? null);
    this.resetToFirstPage();
    this.loadOrders();
  }

  onSortChange(value: PharmacyOrderSort): void {
    this.sortBy.set(value ?? PharmacyOrderSort.NewestFirst);
    this.resetToFirstPage();
    this.loadOrders();
  }

  onHeaderSort(column: 'date' | 'amount'): void {
    const current = this.sortBy();
    if (column === 'date') {
      this.onSortChange(
        current === PharmacyOrderSort.NewestFirst ? PharmacyOrderSort.OldestFirst : PharmacyOrderSort.NewestFirst
      );
    } else if (column === 'amount') {
      this.onSortChange(
        current === PharmacyOrderSort.HighestAmount ? PharmacyOrderSort.LowestAmount : PharmacyOrderSort.HighestAmount
      );
    }
  }

  onOrderDateFromChange(value: string): void {
    this.orderDateFrom.set(value ?? '');
    this.resetToFirstPage();
    this.loadOrders();
  }

  onOrderDateToChange(value: string): void {
    this.orderDateTo.set(value ?? '');
    this.resetToFirstPage();
    this.loadOrders();
  }

  clearDateRange(): void {
    this.orderDateFrom.set('');
    this.orderDateTo.set('');
    this.resetToFirstPage();
    this.loadOrders();
  }

  // ── Branch filter (toolbar) handlers ────────────────────────
  onBranchFilterSearch(query: string): void {
    this.branchFilterQuery$.next(query ?? '');
  }

  onBranchFilterSelected(branch: PharmacyBranchSearchDTO): void {
    this.selectedBranchFilter.set(branch);
    this.branchId.set(branch.branchId);
    this.resetToFirstPage();
    this.loadOrders();
  }

  onBranchFilterCleared(): void {
    this.selectedBranchFilter.set(null);
    this.branchId.set(null);
    this.resetToFirstPage();
    this.loadOrders();
  }

  // ── Pagination ──────────────────────────────────────────────
  onPageChange(event: { first?: number; rows?: number }): void {
    const rows = event.rows ?? this.pageSize();
    const firstIndex = event.first ?? 0;
    this.first.set(firstIndex);
    this.pageSize.set(rows);
    this.pageNumber.set(Math.floor(firstIndex / rows) + 1);
    this.loadOrders();
  }

  private resetToFirstPage(): void {
    this.first.set(0);
    this.pageNumber.set(1);
  }

  // ── Detail modal ────────────────────────────────────────────
  openDetail(order: PharmacyOrderSummaryDTO): void {
    this.orderDetail.set(null);
    this.isDetailDialogOpen.set(true);
    this.isDetailLoading.set(true);

    this.ordersService.getOrderById(order.orderId).subscribe({
      next: (detail) => {
        this.orderDetail.set(detail);
        this.isDetailLoading.set(false);
      },
      error: (problem: ProblemDetails) => {
        this.isDetailLoading.set(false);
        this.isDetailDialogOpen.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail:
            problem.status === 404
              ? 'هذا الطلب غير متاح لصيدليتك أو غير موجود.'
              : problem.detail ?? 'تعذر تحميل تفاصيل الطلب.',
        });
      },
    });
  }

  closeDetail(): void {
    this.isDetailDialogOpen.set(false);
  }

  // ── Presentation helpers ────────────────────────────────────
  itemSubtotal(unitPrice: number, quantity: number): number {
    return (unitPrice ?? 0) * (quantity ?? 0);
  }

  // ── Date helpers: convert <input type="date"> → ISO range ───
  private toIsoStart(value: string): string | null {
    if (!value) return null;
    return new Date(`${value}T00:00:00`).toISOString();
  }

  private toIsoEnd(value: string): string | null {
    if (!value) return null;
    return new Date(`${value}T23:59:59`).toISOString();
  }
}
