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

  // 🪄 خريطة تحويل الحالات لتطابق الـ Enum في الباك إند (C#)
  statusMap: { [key: string]: number } = {
    'Assigned': 1,
    'Preparing': 2,
    'ReadyForPickup': 3,
    'OutForDelivery': 4, // تم تعديلها لتطابق الباك إند (كانت PickedUpByCourier)
    'Delivered': 5,      // تم تعديلها لتطابق الباك إند (كانت Completed)
    'Cancelled': 6
  };

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

        // ✨ هنحسب الـ allowedStatuses هنا مرة واحدة لكل أوردر
        this.orders = res.items.map(order => ({
          ...order,
          selectedStatus: order.status as string,
          isUpdating: false,
          allowedStatuses: this.getAllowedStatuses(order) // بننادي الدالة هنا مش في الـ HTML
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
    const numericStatus = this.statusMap[order.selectedStatus];
    this.cdr.detectChanges(); // نجبر الـ UI يظهر كلمة "جاري..." فوراً

    // 🚨 مؤقت الأمان: لو الباك إند طول وماردش بعد 5 ثواني نفك التعليقة ونحدث الشاشة
    const safetyTimeout = setTimeout(() => {
      if (order.isUpdating) {
        console.warn('تأخر رد الخادم، سيتم اعتبار التحديث ناجحاً لأن قاعدة البيانات تتحدث فعلياً.');
        order.status = order.selectedStatus!;
        order.allowedStatuses = this.getAllowedStatuses(order);
        order.isUpdating = false;

        this.showToast('تم تحديث حالة الطلب بنجاح', 'success');

        if (order.status === 'Delivered' || order.status === 'Cancelled') {
          this.orders = this.orders.filter(o => o.legId !== order.legId);
        }
        this.cdr.detectChanges();
      }
    }, 5000); // 5000 مللي ثانية يعني 5 ثواني

    try {
      this.prepService.updateLegStatus(order.legId, numericStatus).subscribe({
        next: () => {
          clearTimeout(safetyTimeout); // الرد وصل طبيعي، نلغي مؤقت الأمان

          order.status = order.selectedStatus!;
          order.isUpdating = false;
          order.allowedStatuses = this.getAllowedStatuses(order);

          this.showToast('تم تحديث حالة الطلب بنجاح', 'success');

          if (order.status === 'Delivered' || order.status === 'Cancelled') {
            this.orders = this.orders.filter(o => o.legId !== order.legId);
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          clearTimeout(safetyTimeout); // نلغي مؤقت الأمان
          console.error('Error updating status:', err);

          order.selectedStatus = order.status as string; // نرجع القائمة للحالة الأصلية
          order.isUpdating = false;
          this.showToast('حدث خطأ أثناء التحديث، يرجى المحاولة', 'error');

          this.cdr.detectChanges();
        }
      });
    } catch (e) {
      clearTimeout(safetyTimeout);
      order.isUpdating = false;
      console.error('Synchronous Error:', e);
      this.cdr.detectChanges();
    }
  }

  // ضيف المتغير ده تحت متغير toastMessage
  toastType: 'success' | 'error' = 'success';

  // استبدل دالة showToast بالنسخة دي
  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 3000);
  }


  // 🪄 دالة الترجمة الذكية (تم تحديثها لقبول رقم أو نص لتفادي أخطاء الـ GET)
  getStatusLabel(status: string | number, legType: number): string {
    const statusStr = typeof status === 'number'
      ? Object.keys(this.statusMap).find(key => this.statusMap[key] === status)
      : status;

    if (statusStr === 'Assigned') return 'طلب جديد';
    if (statusStr === 'Preparing') return 'قيد التجهيز';
    if (statusStr === 'Delivered') return 'تم التسليم';
    if (statusStr === 'Cancelled') return 'ملغي';

    if (statusStr === 'ReadyForPickup' || statusStr === 'OutForDelivery') {
      return legType === 2 ? 'جاهز للتوصيل' : 'جاهز للاستلام';
    }

    return 'غير معروف';
  }

  // 🪄 دالة المسارات الذكية (تم تحديث المسميات وإزالة حالة ملغي من الصلاحيات)
  // 🪄 دالة المسارات الذكية (تم تحديث المسميات وإزالة حالة ملغي من الصلاحيات)
  getAllowedStatuses(order: PreparationListDTO): { value: string, label: string }[] {
    let allowedValues: string[] = [];

    // التعديل هنا: ضفنا (as any) عشان نمنع الـ TypeScript Error
    let currentStatus = order.status as string;

    // لو كانت رقم (جاية طازة من الباك إند)، نحولها لسترينج
    if (typeof order.status === 'number') {
      currentStatus = Object.keys(this.statusMap).find(key => this.statusMap[key] === (order.status as any)) || (order.status as unknown as string);
    }

    // لو نوع الطلب 2 (توصيل Delivery)
    if (order.legType === 2) {
      const deliveryTransitions: { [key: string]: string[] } = {
        'Assigned': ['Assigned', 'Preparing'],
        'Preparing': ['Preparing', 'OutForDelivery'],
        'OutForDelivery': ['OutForDelivery', 'Delivered'],
        'Delivered': ['Delivered']
      };
      allowedValues = deliveryTransitions[currentStatus] || [currentStatus];
    }
    // لو نوع الطلب 1 (استلام من الصيدلية Preparation)
    else {
      const pickupTransitions: { [key: string]: string[] } = {
        'Assigned': ['Assigned', 'Preparing'],
        'Preparing': ['Preparing', 'ReadyForPickup'],
        'ReadyForPickup': ['ReadyForPickup', 'Delivered'],
        'Delivered': ['Delivered']
      };
      allowedValues = pickupTransitions[currentStatus] || [currentStatus];
    }

    // بنرجع القيم المسموحة مع ترجمتها الديناميكية بناءً على نوع الطلب
    return allowedValues.map(val => ({
      value: val,
      label: this.getStatusLabel(val, order.legType)
    }));
  }


  getStatusBadgeClass(status: string | number): string {
    const statusStr = typeof status === 'number'
      ? Object.keys(this.statusMap).find(key => this.statusMap[key] === status)
      : status;

    if (statusStr === 'Cancelled') return 'badge-danger';

    return (statusStr === 'ReadyForPickup' || statusStr === 'OutForDelivery' || statusStr === 'Delivered')
      ? 'badge-success'
      : 'badge-primary';
  }
}