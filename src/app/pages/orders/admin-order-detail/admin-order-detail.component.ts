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

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
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

  // Leg detail modal state
  showLegDetailModal = false;
  legDetailLoading = false;
  selectedLegDetail: any = null;

  // Update leg status modal state
  showUpdateLegModal = false;
  updatingLeg = false;
  updateLegId = '';
  updateLegNewStatus = 1;
  updateLegAuditReason = '';

  readonly legStatusOptions = [
    { value: 1, label: 'تم القبول' },
    { value: 2, label: 'قيد التحضير' },
    { value: 3, label: 'جاهز للاستلام' },
    { value: 4, label: 'خرج للتوصيل' },
    { value: 5, label: 'تم التسليم' },
    { value: 6, label: 'ملغي' },
  ];

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

  // ── Leg detail modal ──────────────────────────────────────────────────────
  openLegDetail(legId: string): void {
    this.showLegDetailModal = true;
    this.legDetailLoading = true;
    this.selectedLegDetail = null;

    this.adminOrdersService.getLegDetail(legId).subscribe({
      next: (res) => {
        this.selectedLegDetail = res;
        this.legDetailLoading = false;
      },
      error: () => {
        this.legDetailLoading = false;
        this.showLegDetailModal = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تحميل تفاصيل جزء التوصيل.',
        });
      },
    });
  }

  closeLegDetail(): void {
    this.showLegDetailModal = false;
    this.selectedLegDetail = null;
  }

  // ── Update leg status ─────────────────────────────────────────────────────
  openUpdateLegStatus(legId: string, currentStatus: any): void {
    this.updateLegId = legId;
    this.updateLegNewStatus = typeof currentStatus === 'number' ? currentStatus : 1;
    this.updateLegAuditReason = '';
    this.showUpdateLegModal = true;
  }

  closeUpdateLegModal(): void {
    this.showUpdateLegModal = false;
    this.updateLegId = '';
    this.updateLegAuditReason = '';
  }

  submitUpdateLegStatus(): void {
    if (!this.updateLegId || !this.updateLegAuditReason.trim()) return;
    this.updatingLeg = true;

    this.adminOrdersService
      .updateLegStatus(this.updateLegId, this.updateLegNewStatus, this.updateLegAuditReason)
      .subscribe({
        next: () => {
          this.updatingLeg = false;
          this.showUpdateLegModal = false;
          this.messageService.add({
            severity: 'success',
            summary: 'تم التحديث',
            detail: 'تم تحديث حالة جزء التوصيل بنجاح.',
            life: 4000,
          });
          this.loadOrderDetails();
        },
        error: () => {
          this.updatingLeg = false;
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل تحديث حالة جزء التوصيل.',
          });
        },
      });
  }

  // ── Helper status mappings ────────────────────────────────────────────────
  getOrderStatusLabel(s: any): string {
    if (s === null || s === undefined) return '—';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'قيد الانتظار', Pending: 'قيد الانتظار',
      '2': 'قيد المعالجة', Processing: 'قيد المعالجة',
      '3': 'تم الشحن', Shipped: 'تم الشحن',
      '4': 'مكتمل', Completed: 'مكتمل',
      '5': 'ملغي', Cancelled: 'ملغي',
    };
    return map[str] ?? str;
  }

  getOrderStatusClass(s: any): string {
    if (s === null || s === undefined) return 'status-badge badge-default';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'badge-pending', Pending: 'badge-pending',
      '2': 'badge-processing', Processing: 'badge-processing',
      '3': 'badge-shipped', Shipped: 'badge-shipped',
      '4': 'badge-completed', Completed: 'badge-completed',
      '5': 'badge-cancelled', Cancelled: 'badge-cancelled',
    };
    return `status-badge ${map[str] ?? 'badge-default'}`;
  }

  getLegStatusLabel(s: any): string {
    if (s === null || s === undefined || s === '') return 'غير مسند';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'تم القبول', Assigned: 'تم القبول',
      '2': 'قيد التحضير', Preparing: 'قيد التحضير',
      '3': 'جاهز للاستلام', ReadyForPickup: 'جاهز للاستلام',
      '4': 'خرج للتوصيل', OutForDelivery: 'خرج للتوصيل', PickedUpByCourier: 'خرج للتوصيل', InDelivery: 'خرج للتوصيل',
      '5': 'تم التسليم', Delivered: 'تم التسليم', Completed: 'تم التسليم',
      '6': 'ملغي', Cancelled: 'ملغي',
    };
    return map[str] ?? str;
  }

  getLegStatusClass(s: any): string {
    if (s === null || s === undefined || s === '') return 'status-badge badge-none';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'badge-leg-assigned', Assigned: 'badge-leg-assigned',
      '2': 'badge-leg-preparing', Preparing: 'badge-leg-preparing',
      '3': 'badge-leg-ready', ReadyForPickup: 'badge-leg-ready',
      '4': 'badge-leg-out', OutForDelivery: 'badge-leg-out', PickedUpByCourier: 'badge-leg-out', InDelivery: 'badge-leg-out',
      '5': 'badge-leg-delivered', Delivered: 'badge-leg-delivered', Completed: 'badge-leg-delivered',
      '6': 'badge-cancelled', Cancelled: 'badge-cancelled',
    };
    return `status-badge ${map[str] ?? 'badge-default'}`;
  }

  getModeLabel(m: any): string {
    if (m === null || m === undefined) return '—';
    const str = String(m).trim();
    if (str === '1' || str.toLowerCase() === 'delivery') return 'توصيل';
    if (str === '2' || str.toLowerCase() === 'pickup') return 'استلام';
    return str;
  }

  getModeClass(m: any): string {
    if (m === null || m === undefined) return 'status-badge badge-default';
    const str = String(m).trim();
    if (str === '1' || str.toLowerCase() === 'delivery') return 'status-badge badge-delivery';
    if (str === '2' || str.toLowerCase() === 'pickup') return 'status-badge badge-pickup';
    return 'status-badge badge-default';
  }

  getModeIcon(m: any): string {
    if (m === null || m === undefined) return 'pi pi-question';
    const str = String(m).trim();
    if (str === '1' || str.toLowerCase() === 'delivery') return 'pi pi-truck';
    if (str === '2' || str.toLowerCase() === 'pickup') return 'pi pi-shopping-bag';
    return 'pi pi-question';
  }

  getLegTypeLabel(type: any): string {
    if (type === null || type === undefined) return '—';
    const str = String(type).trim();
    const map: Record<string, string> = {
      '1': 'توصيل', Delivery: 'توصيل', delivery: 'توصيل',
      '2': 'استلام', Pickup: 'استلام', pickup: 'استلام',
      '3': 'تحضير', Preparation: 'تحضير', preparation: 'تحضير',
    };
    return map[str] ?? str;
  }

  getItemStatusLabel(s: any): string {
    if (s === null || s === undefined) return '—';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'قيد الانتظار', Pending: 'قيد الانتظار',
      '2': 'تم التوفير', Fulfilled: 'تم التوفير', Completed: 'تم التوفير',
      '3': 'ملغي', Cancelled: 'ملغي',
      '4': 'تمت الإحالة', Awarded: 'تمت الإحالة',
      '5': 'غير متوفر', Unavailable: 'غير متوفر',
    };
    return map[str] ?? str;
  }

  getItemStatusClass(s: any): string {
    if (s === null || s === undefined) return 'status-badge badge-default';
    const str = String(s).trim();
    const map: Record<string, string> = {
      '1': 'badge-pending', Pending: 'badge-pending',
      '2': 'badge-completed', Fulfilled: 'badge-completed', Completed: 'badge-completed',
      '3': 'badge-cancelled', Cancelled: 'badge-cancelled',
      '4': 'badge-shipped', Awarded: 'badge-shipped',
      '5': 'badge-item-unavailable', Unavailable: 'badge-item-unavailable',
    };
    return `status-badge ${map[str] ?? 'badge-default'}`;
  }
}
