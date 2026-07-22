import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminOrdersService } from '@core/services/admin-orders.service';
import { AdminOrderDetailDTO } from '../admin-orders.model';
import { StatusTranslatePipe } from '@shared/pipes/status-translate.pipe';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    StatusTranslatePipe,
  ],
  providers: [MessageService],
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.scss',
})
export class AdminOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminOrdersService = inject(AdminOrdersService);
  private readonly messageService = inject(MessageService);

  orderId = signal<string>('');
  order = signal<AdminOrderDetailDTO | null>(null);
  isLoading = signal<boolean>(false);
  isSplitting = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
      this.loadOrderDetails();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'رقم الطلب غير صحيح.',
      });
      this.router.navigate(['/admin/orders']);
    }
  }

  loadOrderDetails(): void {
    this.isLoading.set(true);
    this.adminOrdersService.getOrderDetails(this.orderId()).subscribe({
      next: (res) => {
        this.order.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تحميل تفاصيل الطلب.',
        });
        this.isLoading.set(false);
      },
    });
  }

  onResplit(): void {
    this.isSplitting.set(true);
    this.adminOrdersService.resplitOrder(this.orderId()).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: res.message || 'تمت إعادة تقسيم الطلب بنجاح وتوزيع الأدوية.',
        });
        this.isSplitting.set(false);
        this.loadOrderDetails();
      },
      error: (err) => {
        const errorDetail = err.error?.detail || err.error?.title || 'فشلت عملية إعادة التقسيم.';
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: errorDetail,
        });
        this.isSplitting.set(false);
      },
    });
  }

  // Helper mappings
  getOrderStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 1: return 'warn';       // Pending
      case 2: return 'info';       // Processing
      case 3: return 'info';       // Shipped
      case 4: return 'success';    // Completed
      case 5: return 'danger';     // Cancelled
      default: return 'secondary';
    }
  }

  getLegStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 1: return 'warn';       // Assigned
      case 2: return 'info';       // Preparing
      case 3: return 'success';    // ReadyForPickup
      case 4: return 'info';       // OutForDelivery
      case 5: return 'success';    // Delivered
      case 6: return 'danger';     // Cancelled
      default: return 'secondary';
    }
  }
}
