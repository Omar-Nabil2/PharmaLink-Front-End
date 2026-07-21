import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreparationListService } from '../../../core/services/preparation-list.service';
import { PreparationListDTO } from '../../../core/interfaces/preparation-list.interface';

@Component({
  selector: 'app-preparation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preparation-list.html',
  styleUrls: ['./preparation-list.scss']
})
export class PreparationListComponent implements OnInit {
  orders: PreparationListDTO[] = [];
  isLoading = false;

  // -- متغيرات الـ Pop up (Toast) --
  toastMessage: string | null = null;
  toastTimeout: any;

  // جميع الحالات الموجودة في LegStatus Enum
  statuses = [
    { value: 'Assigned', label: 'طلب جديد' },
    { value: 'Preparing', label: 'قيد التجهيز' },
    { value: 'ReadyForPickup', label: 'جاهز للاستلام' },
    { value: 'PickedUpByCourier', label: 'جاهز للتوصيل' },
    { value: 'Completed', label: 'تم التسليم' },
    { value: 'Cancelled', label: 'ملغي' }
  ];

  constructor(
    private prepService: PreparationListService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.prepService.getPreparationList().subscribe({
      next: (res) => {
        if (!res || !res.items) {
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.orders = res.items.map(order => ({
          ...order,
          selectedStatus: order.status,
          isUpdating: false
        }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(order: PreparationListDTO): void {
    if (!order.selectedStatus || order.status === order.selectedStatus) return;

    order.isUpdating = true;

    this.prepService.updateLegStatus(order.legId, order.selectedStatus as any).subscribe({
      next: () => {
        order.status = order.selectedStatus!;
        order.isUpdating = false;

        // إظهار رسالة النجاح
        this.showToast('تم تحديث حالة الطلب بنجاح');

        if (order.status === 'Completed' || order.status === 'Cancelled') {
          this.orders = this.orders.filter(o => o.legId !== order.legId);
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating status', err);
        order.selectedStatus = order.status;
        order.isUpdating = false;
        // ممكن تظهر إشعار خطأ هنا برضه لو حابب
        // this.showToast('حدث خطأ أثناء التحديث', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // دالة إظهار الـ Pop up
  showToast(message: string): void {
    this.toastMessage = message;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    // إخفاء الرسالة بعد 3 ثواني
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  // 🪄 دالة الترجمة الذكية (بتتغير حسب نوع الطلب)
  getStatusLabel(status: string, legType: number): string {
    if (status === 'Assigned') return 'طلب جديد';
    if (status === 'Preparing') return 'قيد التجهيز';
    if (status === 'Completed') return 'تم التسليم';
    if (status === 'Cancelled') return 'ملغي';

    // اللعب كله هنا: لو نوع الطلب 2 (توصيل)، يبقى نعرض "جاهز للتوصيل"
    if (status === 'ReadyForPickup' || status === 'PickedUpByCourier') {
      return legType === 2 ? 'جاهز للتوصيل' : 'جاهز للاستلام';
    }

    return 'غير معروف';
  }

  // 🪄 دالة المسارات الذكية (بتفصل مسار التوصيل عن مسار الاستلام)
  getAllowedStatuses(order: PreparationListDTO): { value: string, label: string }[] {
    let allowedValues: string[] = [];

    // لو نوع الطلب 2 (توصيل Delivery)
    if (order.legType === 2) {
      const deliveryTransitions: { [key: string]: string[] } = {
        'Assigned': ['Assigned', 'Preparing'],
        'ReadyForPickup': ['ReadyForPickup', 'Completed'],
        'Preparing': ['Preparing', 'PickedUpByCourier'],
        'PickedUpByCourier': ['PickedUpByCourier', 'Completed'],
        'Completed': ['Completed'],
        'Cancelled': ['Cancelled']
      };
      allowedValues = deliveryTransitions[order.status] || [order.status];
    }
    // لو نوع الطلب 1 (استلام من الصيدلية Preparation)
    else {
      const pickupTransitions: { [key: string]: string[] } = {
        'Assigned': ['Assigned', 'Preparing'],
        // الصيدلي بيجهزه، وبعدين يسلمه للمريض (جاهز للاستلام)
        'Preparing': ['Preparing', 'ReadyForPickup'],
        'ReadyForPickup': ['ReadyForPickup', 'Completed'],
        'Completed': ['Completed'],
        'Cancelled': ['Cancelled']
      };
      allowedValues = pickupTransitions[order.status] || [order.status];
    }

    // بنرجع القيم المسموحة مع ترجمتها الديناميكية بناءً على نوع الطلب
    return allowedValues.map(val => ({
      value: val,
      label: this.getStatusLabel(val, order.legType)
    }));
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'Cancelled') return 'badge-danger';

    return (status === 'ReadyForPickup' || status === 'PickedUpByCourier' || status === 'Completed')
      ? 'badge-success'
      : 'badge-primary';
  }


}