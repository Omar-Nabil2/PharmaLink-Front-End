import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { PrescriptionReviewService } from '@core/services/prescription-review.service';
import { PharmacistDailyMetrics, InventoryAlert, FulfillmentTask } from '@core/interfaces/prescription-review.interface';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-pharmacist-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, BadgeModule, TagModule, ButtonModule, ChartModule, RouterLink],
  templateUrl: './pharmacist-dashboard.component.html',
  styleUrl: './pharmacist-dashboard.component.scss',
})
export class pharmacistDashboardComponent implements OnInit {
  private dashboardService = inject(PrescriptionReviewService);

  metrics = signal<PharmacistDailyMetrics | null>(null);
  inventoryAlerts = signal<InventoryAlert[]>([]);
  pendingTasks = signal<FulfillmentTask[]>([]);
  isLoading = signal<boolean>(true);

  chartData: any;
  chartOptions: any;

  constructor() {
    effect(() => {
      const currentMetrics = this.metrics();
      if (currentMetrics) {
        this.initChartData(currentMetrics);
      }
    });
  }

  ngOnInit() {
    this.initChartOptions();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);

    this.dashboardService.getMetrics().subscribe(res => {
      if (res.isSuccess) this.metrics.set(res.value);
    });

    this.dashboardService.getInventoryAlerts().subscribe(res => {
      if (res.isSuccess) this.inventoryAlerts.set(res.value);
    });

    this.dashboardService.getPendingTasks().subscribe(res => {
      if (res.isSuccess) this.pendingTasks.set(res.value);
      this.isLoading.set(false);
    });
  }

  initChartData(metrics: PharmacistDailyMetrics) {
    this.chartData = {
      labels: ['الروشتات المعلقة', 'الروشتات المكتملة', 'طلبات للتجهيز', 'الطلبات المكتملة'],
      datasets: [
        {
          label: 'إحصائيات اليوم',
          data: [
            metrics.pendingPrescriptionReviews,
            metrics.completedReviewsToday,
            metrics.pendingFulfillmentOrders,
            metrics.completedOrdersToday
          ],
          backgroundColor: [
            '#3b82f6',
            '#00796b',
            '#f59e0b',
            '#10b981'
          ],
          hoverBackgroundColor: [
            '#d97706',
            '#005a4f',
            '#2563eb',
            '#059669'
          ],
          borderRadius: 6
        }
      ]
    };
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
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
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: textColor },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        x: {
          ticks: { color: textColor },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
  }

  getAlertSeverity(type: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    return type === 'Low Stock' ? 'warn' : 'danger';
  }

  chartPlugins = [
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
}
