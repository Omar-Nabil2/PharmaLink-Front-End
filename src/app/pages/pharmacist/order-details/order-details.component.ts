import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionReviewService } from '../../../core/services/prescription-review.service';
import { PharmacistOrderDetailsDto } from '../../../core/interfaces/prescription-review.interface';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule],
  templateUrl: './order-details.component.html'
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private prescriptionService = inject(PrescriptionReviewService);

  order = signal<PharmacistOrderDetailsDto | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(orderId);
    } else {
      this.error.set('لم يتم العثور على رقم الطلب.');
    }
  }

  loadOrderDetails(id: string) {
    this.loading.set(true);
    this.prescriptionService.getPharmacistOrderDetails(id).subscribe({
      next: (res) => {
        this.order.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading order details', err);
        this.error.set('حدث خطأ أثناء جلب تفاصيل الطلب.');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/pharmacist/assigned-orders']);
  }

  getStatusInfo(status: string): { label: string; badgeClass: string } {
    const statusMap: Record<string, { label: string; badgeClass: string }> = {
      'Assigned': { label: 'معين', badgeClass: 'bg-gray-100 text-gray-600' },
      'Preparing': { label: 'قيد المراجعة', badgeClass: 'bg-orange-100 text-orange-600' },
      'ReadyForPickup': { label: 'جاهز للاستلام', badgeClass: 'bg-blue-100 text-blue-600' },
      'OutForDelivery': { label: 'قيد التوصيل', badgeClass: 'bg-cyan-100 text-cyan-600' },
      'Delivered': { label: 'تم التسليم', badgeClass: 'bg-green-100 text-green-600' },
      'Cancelled': { label: 'ملغي', badgeClass: 'bg-red-100 text-red-600' },
      'Completed': { label: 'مكتمل', badgeClass: 'bg-green-100 text-green-600' }
    };
    return statusMap[status] || { label: 'غير معروف', badgeClass: 'bg-gray-100 text-gray-600' };
  }
}
