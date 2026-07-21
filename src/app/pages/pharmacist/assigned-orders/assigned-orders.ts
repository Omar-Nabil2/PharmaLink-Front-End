import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  // Signals
  orders = signal<BranchOrderRowDto[]>([]);
  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(pageNumber: number = 1, pageSize: number = 10) {
    this.loading.set(true);
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
      'Assigned': { label: 'معين', badgeClass: 'bg-gray-100 text-gray-600' },
      'Preparing': { label: 'قيد المراجعة', badgeClass: 'bg-orange-100 text-orange-600' },
      'ReadyForPickup': { label: 'جاهز للاستلام', badgeClass: 'bg-blue-100 text-blue-600' },
      'OutForDelivery': { label: 'قيد التوصيل', badgeClass: 'bg-cyan-100 text-cyan-600' },
      'Delivered': { label: 'تم التسليم', badgeClass: 'bg-green-100 text-green-600' },
      'Cancelled': { label: 'ملغي', badgeClass: 'bg-red-100 text-red-600' }
    };

    return statusMap[status] || { label: 'غير معروف', badgeClass: 'bg-gray-100 text-gray-600' };
  }
}
