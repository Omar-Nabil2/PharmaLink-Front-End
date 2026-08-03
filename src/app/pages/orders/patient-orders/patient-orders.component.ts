import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 👈 إضافة FormsModule للبحث
import { Subject, takeUntil, finalize } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { PatientOrder, PatientOrdersFilter } from '../../../core/interfaces/order.interface';

@Component({
  selector: 'app-patient-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // 👈 إضافة FormsModule
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
    pageSize: 10,
    search: '' // 👈 إضافة خاصية البحث برقم الطلب
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

  const cleanFilter = this.getCleanFilter(this.filter);

  this.orderService.getOrders(cleanFilter).pipe(
    takeUntil(this.destroy$),
    finalize(() => this.isLoading = false)
  ).subscribe({
    next: (res) => {
      this.ngZone.run(() => {
        let rawItems: PatientOrder[] = res.items || res || [];

        // 1. معالجة وتنسيق البيانات
        let processedOrders = rawItems.map(order => ({
          ...order,
          orderNumber: order.orderNumber || `ORD-${order.orderId?.substring(0, 8).toUpperCase()}`,
          createdAt: order.createdAt || new Date().toISOString()
        }));

        // 2. فلترة بالسيرش (إذا الباك إند لم يفلترها)
        if (this.filter.search && this.filter.search.trim() !== '') {
          const query = this.filter.search.trim().toLowerCase();
          processedOrders = processedOrders.filter(o => 
            o.orderNumber?.toLowerCase().includes(query) ||
            o.orderId?.toLowerCase().includes(query)
          );
        }

        // 3. فلترة بالـ Status (إذا الباك إند لم يفلترها)
        if (this.filter.status) {
          const targetStatus = this.filter.status.toString().toLowerCase();
          processedOrders = processedOrders.filter(o => {
            const st = o.orderStatus?.toString().toLowerCase();
            if (targetStatus === 'processing') {
              return st === 'processing' || st === 'pending' || st === 'readyforpickup';
            }
            return st === targetStatus;
          });
        }

        this.orders = processedOrders;
        this.totalPages = res.totalPages || 1;
        this.hasPreviousPage = res.hasPreviousPage || false;
        this.hasNextPage = res.hasNextPage || false;
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
    
    delete this.filter.status;

    switch (tab) {
      case 'All':
        break;
      case 'Active':
        this.filter.status = 'Processing'; 
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

  // 👈 دالة تشغيل البحث برقم الطلب
  onSearch(): void {
    this.loadOrders(true);
  }

  private getCleanFilter(filterObj: PatientOrdersFilter): PatientOrdersFilter {
    const cleaned = { ...filterObj };
    if (!cleaned.status) {
      delete cleaned.status;
    }
    if (!cleaned.search || cleaned.search.trim() === '') {
      delete cleaned.search;
    }
    return cleaned;
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
    const st = status?.toString().toLowerCase();
    switch (st) {
      case 'completed':
      case 'مكتمل': 
        return 'bg-green-100 text-green-700';
      case 'processing':
      case 'readyforpickup':
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'pending': 
        return 'bg-orange-100 text-orange-700';
      case 'shipped': 
      case 'outfordelivery':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled': 
        return 'bg-red-100 text-red-700';
      default: 
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusText(status: string): string {
    const st = status?.toString().toLowerCase();
    switch (st) {
      case 'completed': return 'مكتمل';
      case 'processing': return 'جاري التجهيز';
      case 'readyforpickup': return 'جاهز للاستلام';
      case 'pending': return 'قيد المراجعة';
      case 'shipped': 
      case 'outfordelivery': return 'جاري التوصيل';
      case 'cancelled': return 'ملغي';
      default: return status || 'غير محدد';
    }
  }

  getMedicinesSummary(order: PatientOrder): string {
    let summary: string[] = [];
    
    // الأدوية التي تم تخصيصها لصيدليات
    if (order.fulfillmentLegs && order.fulfillmentLegs.length > 0) {
      order.fulfillmentLegs.forEach(leg => {
        if (leg.items) {
          leg.items.forEach(item => {
            summary.push(`${item.drugName || item.genericName} × ${item.quantityNeeded}`);
          });
        }
      });
    }
    
    // الأدوية التي لا تزال قيد الانتظار (لم تخصص بعد)
    if (order.pendingAssignmentItems && order.pendingAssignmentItems.length > 0) {
      order.pendingAssignmentItems.forEach(item => {
        summary.push(`${item.drugName || item.genericName} × ${item.quantityNeeded}`);
      });
    }

    return summary.length > 0 ? summary.join(' ، ') : 'لا توجد تفاصيل للأدوية';
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