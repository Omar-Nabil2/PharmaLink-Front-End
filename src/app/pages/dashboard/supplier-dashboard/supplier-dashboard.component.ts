import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { SupplierOrdersService } from '../../../../app/core/services/supplier-orders.service';
import { POStatus, SupplierOrderDTO } from '../../../../app/core/interfaces/supplier-orders.model';

@Component({
    selector: 'app-supplier-dashboard',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, DatePipe, FormsModule, CardModule, TableModule, ToastModule, SelectModule],
    providers: [MessageService],
    templateUrl: './supplier-dashboard.component.html',
    styleUrl: './supplier-dashboard.component.scss' // حط فيها ستايل الـ Table بتاعك
})
export class SupplierDashboardComponent {
    private readonly supplierOrderService = inject(SupplierOrdersService);
    private readonly messageService = inject(MessageService);

    // فلتر حالة الطلبات
    readonly selectedStatus = signal<POStatus | undefined>(undefined);
    readonly statusOptions = [
        { label: 'الكل', value: undefined },
        { label: 'طلبات جديدة', value: POStatus.SentToSupplier },
        { label: 'تم القبول', value: POStatus.AcceptedBySupplier },
        { label: 'جاري التجهيز', value: POStatus.ProcessingBySupplier },
        { label: 'تم الشحن', value: POStatus.Shipped }
    ];

    // جلب البيانات بـ rxResource
    readonly ordersResource = rxResource({
        params: () => ({ status: this.selectedStatus() }),
        stream: ({ params }) => this.supplierOrderService.getMyOrders(params.status)
    });

    readonly orders = computed(() => this.ordersResource.value() ?? []);
    readonly isLoading = computed(() => this.ordersResource.isLoading());

    // إحصائيات سريعة للكروت
    readonly kpis = computed(() => {
        const all = this.orders();
        return {
            total: all.length,
            newOrders: all.filter(o => o.currentStatus === 'SentToSupplier').length,
            processing: all.filter(o => o.currentStatus === 'AcceptedBySupplier' || o.currentStatus === 'ProcessingBySupplier').length,
        };
    });

    readonly actionLoading = signal<Record<string, boolean>>({});

    // ─── Actions ───

    acceptOrder(orderId: string): void {
        this.setActionLoading(orderId, true);
        this.supplierOrderService.acceptOrder(orderId).subscribe({
            next: (res) => this.handleSuccess(orderId, res.message),
            error: (err) => this.handleError(orderId)
        });
    }

    rejectOrder(orderId: string): void {
        this.setActionLoading(orderId, true);
        this.supplierOrderService.rejectOrder(orderId).subscribe({
            next: (res) => this.handleSuccess(orderId, res.message),
            error: (err) => this.handleError(orderId)
        });
    }

    updateStatus(orderId: string, newStatus: POStatus): void {
        this.setActionLoading(orderId, true);
        this.supplierOrderService.updateOrderStatus(orderId, newStatus).subscribe({
            next: (res) => this.handleSuccess(orderId, res.message),
            error: (err) => this.handleError(orderId)
        });
    }

    // ─── Helpers ───

    private setActionLoading(orderId: string, isLoading: boolean): void {
        this.actionLoading.update(state => ({ ...state, [orderId]: isLoading }));
    }

    private handleSuccess(orderId: string, msg: string): void {
        this.messageService.add({ severity: 'success', summary: 'تم', detail: msg });
        this.setActionLoading(orderId, false);
        this.ordersResource.reload();
    }

    private handleError(orderId: string): void {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء تنفيذ العملية' });
        this.setActionLoading(orderId, false);
    }

    // لترجمة الحالة وعرض لون مختلف
    getStatusBadge(statusStr: string): { label: string, class: string } {
        switch (statusStr) {
            case 'SentToSupplier': return { label: 'جديد (بانتظار ردك)', class: 'bg-warning/20 text-warning-foreground' };
            case 'AcceptedBySupplier': return { label: 'تم القبول', class: 'bg-info/20 text-info' };
            case 'ProcessingBySupplier': return { label: 'جاري التجهيز', class: 'bg-primary/20 text-primary' };
            case 'Shipped': return { label: 'تم الشحن', class: 'bg-accent/20 text-accent' };
            case 'Delivered': return { label: 'تم التوصيل', class: 'bg-muted text-muted-foreground' };
            case 'RejectedBySupplier': return { label: 'مرفوض', class: 'bg-destructive/20 text-destructive' };
            default: return { label: statusStr, class: 'bg-muted text-muted-foreground' };
        }
    }

    // لجعل الـ Enum متاح في الـ HTML
    get POStatus() { return POStatus; }
}