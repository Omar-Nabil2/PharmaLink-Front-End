import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { PatientDashboardService } from '../../../core/services/patient-dashboard.service';
import { CartService } from '../../../core/services/cart.service';
import { PatientDashboardData, DashboardStatistics, RecentOrder, CurrentOrder } from '../../../core/interfaces/patient-dashboard.interface';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, TableModule, BadgeModule, TagModule, ButtonModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss',
})
export class PatientDashboardComponent implements OnInit {
  private readonly dashboardService = inject(PatientDashboardService);
  private readonly cartService = inject(CartService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = true;
  errorMessage = '';

  statistics?: DashboardStatistics;
  currentOrder?: CurrentOrder | null;
  recentOrders: RecentOrder[] = [];
  hasMoreOrders = false;

  cartItemCount = 0;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      dashboard: this.dashboardService.getDashboardData(),
      cart: this.cartService.getCart(),
    }).subscribe({
      next: ({ dashboard, cart }) => {
        this.statistics = dashboard.statistics;
        this.currentOrder = dashboard.currentOrder;
        this.recentOrders = dashboard.recentOrders || [];
        this.hasMoreOrders = dashboard.hasMoreOrders || false;
        this.cartItemCount = cart?.items?.length ?? 0;
        this.isLoading = false;
        this.cdr.detectChanges();   // ← الإضافة المهمة
      },
      error: (error) => {
        this.errorMessage = 'فشل في تحميل بيانات لوحة التحكم.';
        this.isLoading = false;
        console.error(error);
        this.cdr.detectChanges();   // ← ولو حصل خطأ كمان
      },
    });
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'approved':
      case 'completed':
        return 'success';
      case 'in transit':
      case 'pending':
      case 'assigned':
        return 'info';
      case 'cancelled':
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}