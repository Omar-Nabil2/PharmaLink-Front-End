import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { PatientOrder, PatientOrdersFilter, OrderStatus } from '../../../core/interfaces/order.interface';

@Component({
  selector: 'app-patient-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-orders.component.html',
  styleUrls: ['./patient-orders.component.scss']
})
export class PatientOrdersComponent implements OnInit, OnDestroy {
  orders: PatientOrder[] = [];
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Pagination & Filtering
  filter: PatientOrdersFilter = {
    pageNumber: 1,
    pageSize: 10
  };
  
  totalPages = 1;
  hasPreviousPage = false;
  hasNextPage = false;

  activeTab: 'All' | 'Active' | 'Completed' | 'Cancelled' = 'All';

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(resetPage = false): void {
    if (resetPage) {
      this.filter.pageNumber = 1;
    }

    this.isLoading = true;
    this.error = null;

    this.orderService.getOrders(this.filter).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          // Compute fields for display if they are missing
          this.orders = res.items.map(order => ({
            ...order,
            orderNumber: order.orderNumber || `ORD-${order.orderId.substring(0, 8).toUpperCase()}`,
            createdAt: order.createdAt || new Date().toISOString() // Fallback if missing
          }));
          this.totalPages = res.totalPages;
          this.hasPreviousPage = res.hasPreviousPage;
          this.hasNextPage = res.hasNextPage;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error loading orders:', err);
          this.error = 'حدث خطأ أثناء تحميل الطلبات.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  setTab(tab: 'All' | 'Active' | 'Completed' | 'Cancelled'): void {
    this.activeTab = tab;
    switch (tab) {
      case 'All':
        this.filter.status = null;
        break;
      case 'Active':
        this.filter.status = 'Processing'; // Adjust based on your actual active statuses, e.g. Pending/Processing/Shipped
        break;
      case 'Completed':
        this.filter.status = 'Completed';
        break;
      case 'Cancelled':
        this.filter.status = 'Cancelled';
        break;
    }
    this.loadOrders(true);
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.filter.pageNumber++;
      this.loadOrders();
    }
  }

  prevPage(): void {
    if (this.hasPreviousPage) {
      this.filter.pageNumber--;
      this.loadOrders();
    }
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
      case 'Processing': return 'قيد التوصيل'; // or 'جاري التجهيز'
      case 'Pending': return 'قيد المراجعة';
      case 'Shipped': return 'في الطريق';
      case 'Cancelled': return 'ملغي';
      default: return status;
    }
  }

  getMedicinesSummary(order: PatientOrder): string {
    let summary: string[] = [];
    if (order.fulfillmentLegs) {
      order.fulfillmentLegs.forEach(leg => {
        if (leg.items) {
          leg.items.forEach(item => {
            summary.push(`${item.drugName || item.genericName} × ${item.quantityNeeded}`);
          });
        }
      });
    }
    return summary.length > 0 ? summary.join(' ، ') : 'لا يوجد تفاصيل';
  }

  getPharmacyNames(order: PatientOrder): string {
    let names = new Set<string>();
    if (order.fulfillmentLegs) {
      order.fulfillmentLegs.forEach(leg => {
        if (leg.pharmacyName) names.add(leg.pharmacyName);
      });
    }
    return names.size > 0 ? Array.from(names).join(' ، ') : 'صيدلية غير محددة';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
