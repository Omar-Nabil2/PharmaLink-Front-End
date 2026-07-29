import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { ChartData } from 'chart.js';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { AdminDashboardService } from '@core/services/admin-dashboard.service';
import { StatusTranslatePipe } from '@shared/pipes/status-translate.pipe';
import {
  AdminDashboardDTO,
  AdminRecentOrderDTO,
  AdminTopPharmacyDTO,
  OrderStatusValue,
} from './admin-dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    CardModule,
    TableModule,
    ChartModule,
    TagModule,
    SkeletonModule,
    ButtonModule,
    StatusTranslatePipe,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly adminDashboardService = inject(AdminDashboardService);

  // ── Data resource ──────────────────────────────────────────────────────────
  private readonly dashboardResource = rxResource({
    stream: () => this.adminDashboardService.getAdminDashboard(),
  });

  readonly dashboard = computed<AdminDashboardDTO | undefined>(
    () => this.dashboardResource.value(),
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
        return 'ليس لديك صلاحية للوصول إلى لوحة تحكم النظام.';
      default:
        return (
          err.detail ?? err.title ?? 'حدث خطأ أثناء تحميل لوحة التحكم. يرجى المحاولة مرة أخرى.'
        );
    }
  });

  // ── Computed slices ────────────────────────────────────────────────────────
  readonly platformStats = computed(() => this.dashboard()?.platformStats);
  readonly recentOrders = computed<AdminRecentOrderDTO[]>(
    () => this.dashboard()?.recentOrders ?? [],
  );
  readonly topPharmacies = computed<AdminTopPharmacyDTO[]>(
    () => this.dashboard()?.topPharmacies ?? [],
  );

  // ── Chart: 30-day orders line ──────────────────────────────────────────────
  readonly ordersLineChartData = computed(() => {
    const series = this.dashboard()?.orderAnalytics?.dailyOrdersLast30Days ?? [];
    return {
      labels: series.map((p) => {
        const d = new Date(p.date);
        return d.getDate().toString();
      }),
      datasets: [
        {
          label: 'الطلبات',
          data: series.map((p) => p.count),
          backgroundColor: '#007671',
          borderRadius: 10,
        },
      ],
    };
  });

  readonly ordersLineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        backgroundColor: '#ffffff',
        titleColor: '#1e293b',
        bodyColor: '#007671',
        borderColor: '#e2e8e6',
        borderWidth: 1,
        titleFont: { family: 'Cairo, sans-serif', size: 14, weight: 'bold' },
        bodyFont: { family: 'Cairo, sans-serif', size: 14, weight: 'medium' },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items: { label: string }[]) => `اليوم ${items[0]?.label}`,
          label: (item: { parsed: { y: number } }) => ` ${item.parsed.y} طلب`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7a76', font: { family: 'Cairo, sans-serif', size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(107,122,118,0.12)' },
        ticks: { color: '#6b7a76', font: { family: 'Cairo, sans-serif', size: 11 }, precision: 0 },
      },
    },
  };

  readonly chartPlugins = [
    {
      id: 'barHoverBackground',
      beforeDatasetsDraw: (chart: any) => {
        const activeElements = chart.getActiveElements();
        if (activeElements?.length) {
          const ctx = chart.ctx;
          const activeElement = activeElements[0];
          const x = activeElement.element.x;
          const width = activeElement.element.width + 16;
          const top = chart.chartArea.top;
          const bottom = chart.chartArea.bottom;

          ctx.save();
          ctx.fillStyle = '#cccccc';
          ctx.fillRect(x - width / 2, top, width, bottom - top);
          ctx.restore();
        }
      }
    }
  ];

  // ── Chart: order status doughnut ────────────────────────────────────────────
  readonly statusDoughnutData = computed<ChartData<'doughnut'> | undefined>(() => {
    const a = this.dashboard()?.orderAnalytics;
    if (!a) return undefined;
    return {
      labels: ['قيد الانتظار', 'جاري التجهيز', 'جاري التوصيل', 'مكتمل', 'ملغى'],
      datasets: [
        {
          data: [
            a.pendingOrders,
            a.processingOrders,
            a.shippedOrders,
            a.completedOrders,
            a.cancelledOrders,
          ],
          backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#0f9d76', '#ef4444'],
          hoverBackgroundColor: ['#d97706', '#2563eb', '#7c3aed', '#0d8b67', '#dc2626'],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  });

  readonly statusDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        rtl: true,
        labels: {
          color: '#374151',
          font: { family: 'Cairo, sans-serif', size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        rtl: true,
        backgroundColor: '#1a2b28',
        titleFont: { family: 'Cairo, sans-serif' },
        bodyFont: { family: 'Cairo, sans-serif' },
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Returns Tailwind classes for the order-status badge. */
  getOrderStatusClass(status: OrderStatusValue): string {
    const base = 'status-badge';
    switch (status) {
      case 1:
        return `${base} status-pending`;
      case 2:
        return `${base} status-processing`;
      case 3:
        return `${base} status-shipped`;
      case 4:
        return `${base} status-completed`;
      case 5:
        return `${base} status-cancelled`;
      default:
        return `${base} status-default`;
    }
  }

  /** Renders 0–5 filled/empty star characters for a rating. */
  getStars(rating: number): { filled: number[]; empty: number[] } {
    const filled = Math.round(rating);
    return {
      filled: Array(Math.min(filled, 5)).fill(0),
      empty: Array(Math.max(5 - filled, 0)).fill(0),
    };
  }

  reload(): void {
    this.dashboardResource.reload();
  }
}
