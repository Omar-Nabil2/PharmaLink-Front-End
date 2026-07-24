import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { PatientOrder } from '../../../core/interfaces/order.interface';

@Component({
  selector: 'app-patient-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-order-detail.component.html',
  styleUrls: ['./patient-order-detail.component.scss']
})
export class PatientOrderDetailComponent implements OnInit, OnDestroy {
  order: PatientOrder | null = null;
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.error = 'رقم الطلب غير صالح.';
      this.isLoading = false;
    }
  }

  loadOrder(orderId: string): void {
    this.isLoading = true;
    this.error = null;

    this.orderService.getOrderById(orderId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (order) => {
        this.ngZone.run(() => {
          this.order = {
            ...order,
            orderNumber: order.orderNumber || `ORD-${order.orderId.substring(0, 8).toUpperCase()}`,
            createdAt: order.createdAt || new Date().toISOString()
          };
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error loading order details:', err);
          this.error = 'حدث خطأ أثناء تحميل تفاصيل الطلب.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      case 'Shipped': return 'bg-purple-100 text-purple-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Completed': return 'مكتمل';
      case 'Processing': return 'قيد التوصيل / التجهيز';
      case 'Pending': return 'قيد المراجعة';
      case 'Shipped': return 'في الطريق';
      case 'Cancelled': return 'ملغي';
      default: return status;
    }
  }

  getLegStatusText(status: string): string {
    switch(status) {
      case 'Assigned': return 'تم التعيين';
      case 'Completed': return 'مكتمل';
      case 'Processing': return 'قيد التجهيز';
      default: return status;
    }
  }

  getItemStatusText(status: string): string {
    switch(status) {
      case 'Awarded': return 'متوفر';
      case 'Unavailable': return 'غير متوفر';
      default: return status;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
