import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PrescriptionReviewService } from '../../../core/services/prescription-review.service';
import { BranchOrderRowDto } from '../../../core/interfaces/prescription-review.interface';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-assigned-orders',
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './assigned-orders.html',
  styleUrl: './assigned-orders.scss',
})
export class AssignedOrders {
  private fulfillmentService = inject(PrescriptionReviewService);
  private router = inject(Router);

  // Signals
  orders = signal<BranchOrderRowDto[]>([]);
  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(pageNumber: number = 1, pageSize: number = 10) {
    this.loading.set(true);
    this.orders.set([]);
    this.fulfillmentService.getAssignedOrders(pageNumber, pageSize).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.orders.set(res.value.items);
          this.totalRecords.set(res.value.items.length);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.loading.set(false);
      }
    });
  }

  getStatusInfo(status: string): { label: string; badgeClass: string } {
    const statusMap: Record<string, { label: string; badgeClass: string }> = {
      'Assigned': { label: 'معين', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
      'Preparing': { label: 'قيد المراجعة', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' },
      'ReadyForPickup': { label: 'جاهز للاستلام', badgeClass: 'bg-blue-100 text-blue-700 border-blue-200' },
      'OutForDelivery': { label: 'قيد التوصيل', badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
      'Delivered': { label: 'تم التسليم', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      'Cancelled': { label: 'ملغي', badgeClass: 'bg-rose-100 text-rose-700 border-rose-200' },
      'OrderCreated': { label: 'تم إنشاء الطلب', badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200' }
    };

    return statusMap[status] || { label: 'غير معروف', badgeClass: 'bg-gray-100 text-gray-600 border-gray-200' };
  }

  viewOrderDetails(orderId: string) {
    this.router.navigate(['/pharmacist/assigned-orders', orderId]);
  }
}
