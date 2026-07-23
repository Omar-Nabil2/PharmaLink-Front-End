import { Component, DestroyRef, computed, inject, input, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PharmacyDashboardService } from '@core/services/pharmacy-dashboard.service';
import { SearchService } from '@core/services/search.service';
import { PharmacyBranchSearchDTO } from '@pages/inventory/search.model';
import { StatusTranslatePipe } from '@shared/pipes/status-translate.pipe';
import {
  ALL_BRANCHES,
  BranchOption,
  DailySalesDTO,
  LegStatus,
  PharmacyDashboardDTO,
  PharmacyRecentOrderDTO,
} from './pharmacy-dashboard.model';

@Component({
  selector: 'app-pharmacy-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    CardModule,
    TableModule,
    ChartModule,
    SelectModule,
    AutoCompleteModule,
    StatusTranslatePipe,
  ],
  templateUrl: './pharmacy-dashboard.component.html',
  styleUrl: './pharmacy-dashboard.component.scss',
})
export class PharmacyDashboardComponent {
  private readonly dashboardService = inject(PharmacyDashboardService);
  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);

  readonly branchId = input<string | undefined>(undefined);

  readonly selectedBranchId = signal<string>(ALL_BRANCHES);

  // ── Branch search (autocomplete) state ──────────────────────
  readonly branchFilterSuggestions = signal<PharmacyBranchSearchDTO[]>([]);
  readonly selectedBranchFilter = signal<PharmacyBranchSearchDTO | null>(null);
  private readonly branchFilterQuery$ = new Subject<string>();

  constructor() {
    effect(() => {
      const routeBranch = this.branchId();
      if (routeBranch) {
        this.selectedBranchId.set(routeBranch);
      }
    });

    // Debounced branch search stream (300ms) → SearchService.searchBranches.
    this.branchFilterQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.searchService.searchBranches(term)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => this.branchFilterSuggestions.set(results ?? []));
  }

  private readonly dashboardResource = rxResource({
    params: () => ({ branchId: this.selectedBranchId() }),
    stream: ({ params }) =>
      params.branchId && params.branchId !== ALL_BRANCHES
        ? this.dashboardService.getBranchDashboard(params.branchId)
        : this.dashboardService.getOwnerDashboard(),
  });

  readonly dashboard = computed<PharmacyDashboardDTO | undefined>(() =>
    this.dashboardResource.value(),
  );

  readonly isLoading = computed(() => this.dashboardResource.isLoading());

  readonly errorMessage = computed<string | null>(() => {
    const err = this.dashboardResource.error() as
      | { status?: number; detail?: string; title?: string }
      | undefined;
    if (!err) return null;

    switch (err.status) {
      case 401:
        return 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.';
      case 403:
        return 'ليس لديك صلاحية للوصول إلى لوحة تحكم الصيدلية.';
      case 404:
        return 'تعذر العثور على بيانات لوحة التحكم لهذه الصيدلية.';
      default:
        return (
          err.detail ??
          err.title ??
          'حدث خطأ أثناء تحميل لوحة التحكم. يرجى المحاولة مرة أخرى.'
        );
    }
  });

  readonly kpis = computed(() => this.dashboard()?.kpis);
  readonly lowStockAlert = computed(() => this.dashboard()?.lowStockAlert);
  readonly salesTrend = computed<DailySalesDTO[]>(() => this.dashboard()?.salesTrend ?? []);
  readonly recentOrders = computed<PharmacyRecentOrderDTO[]>(
    () => this.dashboard()?.recentOrders ?? [],
  );

  readonly branchOptions = computed<BranchOption[]>(() => {
    const branches = this.dashboard()?.branches ?? [];
    return [
      { id: ALL_BRANCHES, name: 'جميع الفروع' },
      ...branches.map((branch) => ({ id: branch.branchId, name: branch.branchName })),
    ];
  });

  readonly hasLowStock = computed(() => {
    const alert = this.lowStockAlert();
    return !!alert && (alert.restockNeeded || alert.lowStockCount > 0);
  });

  readonly salesChartData = computed(() => {
    const series = this.salesTrend();
    return {
      labels: series.map((point) => point.date),
      datasets: [
        {
          label: 'المبيعات (ج.م)',
          data: series.map((point) => point.salesAmount),
          fill: true,
          tension: 0.4,
          borderColor: '#0f9d76',
          backgroundColor: 'rgba(15, 157, 118, 0.12)',
          pointBackgroundColor: '#0f9d76',
          pointBorderColor: '#ffffff',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ],
    };
  });

  readonly salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        backgroundColor: '#1a2b28',
        titleFont: { family: 'Cairo, sans-serif' },
        bodyFont: { family: 'Cairo, sans-serif' },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7a76', font: { family: 'Cairo, sans-serif' } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e2e8e6' },
        ticks: { color: '#6b7a76', font: { family: 'Cairo, sans-serif' } },
      },
    },
  };

  onBranchChange(branchId: string): void {
    this.selectedBranchId.set(branchId ?? ALL_BRANCHES);
  }

  // ── Branch search (autocomplete) handlers ───────────────────
  onBranchFilterSearch(query: string): void {
    this.branchFilterQuery$.next(query ?? '');
  }

  onBranchFilterSelected(branch: PharmacyBranchSearchDTO): void {
    this.selectedBranchFilter.set(branch);
    this.selectedBranchId.set(branch.branchId);
  }

  onBranchFilterCleared(): void {
    this.selectedBranchFilter.set(null);
    this.selectedBranchId.set(ALL_BRANCHES);
  }

  /**
   * Tailwind classes for a recent-order status badge. The visible label is
   * translated to Arabic in the template via the `statusTranslate` pipe, so this
   * only needs to resolve the color treatment from the leg status.
   */
  getStatusBadgeClasses(order: PharmacyRecentOrderDTO): string {
    const base = 'inline-flex items-center rounded-full px-3 py-1 text-[10px] lg:text-xs font-medium';

    switch (this.normalizeStatus(order.legStatus)) {
      case 'completed':
        return `${base} bg-accent/15 text-accent`;
      case 'readyforpickup':
      case 'pickedupbycourier':
        return `${base} bg-info/15 text-info`;
      case 'assigned':
      case 'preparing':
        return `${base} bg-warning/15 text-warning-foreground`;
      case 'cancelled':
        return `${base} bg-destructive/15 text-destructive`;
      default:
        return `${base} bg-muted text-muted-foreground`;
    }
  }

  private normalizeStatus(status: LegStatus): string {
    if (typeof status === 'number') {
      // Mirrors backend Domain.Enums.LegStatus (byte enum, 1-based).
      const byOrdinal: Record<number, string> = {
        1: 'assigned',
        2: 'preparing',
        3: 'readyforpickup',
        4: 'pickedupbycourier',
        5: 'completed',
        6: 'cancelled',
      };
      return byOrdinal[status] ?? String(status);
    }
    return String(status).toLowerCase();
  }

  reload(): void {
    this.dashboardResource.reload();
  }
}
